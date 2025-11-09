import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";
import {
  sanitizeString,
  sanitizeHtmlContent,
  validateNumber,
  validateBoolean,
  validateObjectId,
  validateEnum,
  sanitizeUserInfo,
  sanitizeQuestions,
  sanitizePreScreeningQuestions,
} from "@/lib/utils/sanitize";

// Allowed values for enums
const ALLOWED_SCREENING_SETTINGS = ["Good Fit and above", "Only Strong Fit", "No Automatic Promotion"];
const ALLOWED_WORK_SETUP = ["Fully Remote", "Onsite", "Hybrid"];
const ALLOWED_EMPLOYMENT_TYPE = ["Full-Time", "Part-Time"];
const ALLOWED_STATUS = ["active", "inactive"];

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    
    // Validate and sanitize required fields
    let jobTitle, description, location, workSetup, orgID;
    try {
      jobTitle = sanitizeString(requestData.jobTitle, 200);
      description = sanitizeHtmlContent(requestData.description, 50000);
      location = sanitizeString(requestData.location, 200);
      workSetup = sanitizeString(requestData.workSetup, 100);
      orgID = requestData.orgID;
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Invalid input data" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!jobTitle || jobTitle.length === 0) {
      return NextResponse.json(
        { error: "Job title is required and cannot be empty" },
        { status: 400 }
      );
    }
    
    if (!description || description.length === 0) {
      return NextResponse.json(
        { error: "Description is required and cannot be empty" },
        { status: 400 }
      );
    }
    
    if (!location || location.length === 0) {
      return NextResponse.json(
        { error: "Location is required and cannot be empty" },
        { status: 400 }
      );
    }
    
    if (!workSetup || workSetup.length === 0) {
      return NextResponse.json(
        { error: "Work setup is required and cannot be empty" },
        { status: 400 }
      );
    }

    if (!orgID || !validateObjectId(orgID)) {
      return NextResponse.json(
        { error: "Valid organization ID is required" },
        { status: 400 }
      );
    }

    // Validate and sanitize optional fields
    let questions;
    let preScreeningQuestions;
    try {
      questions = requestData.questions ? sanitizeQuestions(requestData.questions) : [];
      if (questions.length === 0) {
        return NextResponse.json(
          { error: "Questions are required" },
          { status: 400 }
        );
      }
      preScreeningQuestions = requestData.preScreeningQuestions ? sanitizePreScreeningQuestions(requestData.preScreeningQuestions) : [];
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Invalid questions data" },
        { status: 400 }
      );
    }

    // Validate and sanitize user info
    let lastEditedBy, createdBy;
    try {
      lastEditedBy = sanitizeUserInfo(requestData.lastEditedBy);
      createdBy = sanitizeUserInfo(requestData.createdBy);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Invalid user information" },
        { status: 400 }
      );
    }

    // Validate and sanitize screening settings
    const cvScreeningSetting = requestData.cvScreeningSetting 
      ? (validateEnum(requestData.cvScreeningSetting, ALLOWED_SCREENING_SETTINGS)
          ? requestData.cvScreeningSetting
          : ALLOWED_SCREENING_SETTINGS[0])
      : ALLOWED_SCREENING_SETTINGS[0];
    
    const aiInterviewScreeningSetting = requestData.aiInterviewScreeningSetting
      ? (validateEnum(requestData.aiInterviewScreeningSetting, ALLOWED_SCREENING_SETTINGS)
          ? requestData.aiInterviewScreeningSetting
          : ALLOWED_SCREENING_SETTINGS[0])
      : ALLOWED_SCREENING_SETTINGS[0];

    // Sanitize secret prompts (HTML content)
    const cvSecretPrompt = requestData.cvSecretPrompt 
      ? sanitizeHtmlContent(requestData.cvSecretPrompt, 10000)
      : "";
    
    const aiInterviewSecretPrompt = requestData.aiInterviewSecretPrompt
      ? sanitizeHtmlContent(requestData.aiInterviewSecretPrompt, 10000)
      : "";

    // Validate and sanitize other fields
    const workSetupRemarks = requestData.workSetupRemarks
      ? sanitizeHtmlContent(requestData.workSetupRemarks, 2000)
      : "";

    const status = requestData.status && validateEnum(requestData.status, ALLOWED_STATUS)
      ? requestData.status
      : "active";

    const requireVideo = validateBoolean(requestData.requireVideo ?? true);
    const salaryNegotiable = validateBoolean(requestData.salaryNegotiable ?? false);

    const minimumSalary = validateNumber(requestData.minimumSalary);
    const maximumSalary = validateNumber(requestData.maximumSalary);

    // Validate salary range
    if (minimumSalary !== null && maximumSalary !== null && minimumSalary > maximumSalary) {
      return NextResponse.json(
        { error: "Minimum salary cannot be greater than maximum salary" },
        { status: 400 }
      );
    }

    // Validate and sanitize location fields
    const country = sanitizeString(requestData.country || "Philippines", 100);
    const province = requestData.province ? sanitizeString(requestData.province, 200) : "";
    const employmentType = requestData.employmentType && validateEnum(requestData.employmentType, ALLOWED_EMPLOYMENT_TYPE)
      ? requestData.employmentType
      : "Full-Time";

    const { db } = await connectMongoDB();

    const orgDetails = await db.collection("organizations").aggregate([
      {
        $match: {
          _id: new ObjectId(orgID)
        }
      },
      {
        $lookup: {
            from: "organization-plans",
            let: { planId: "$planId" },
            pipeline: [
                {
                    $addFields: {
                        _id: { $toString: "$_id" }
                    }
                },
                {
                    $match: {
                        $expr: { $eq: ["$_id", "$$planId"] }
                    }
                }
            ],
            as: "plan"
        }
      },
      {
        $unwind: "$plan"
      },
    ]).toArray();

    if (!orgDetails || orgDetails.length === 0) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const totalActiveCareers = await db.collection("careers").countDocuments({ orgID, status: "active" });

    if (totalActiveCareers >= (orgDetails[0].plan.jobLimit + (orgDetails[0].extraJobSlots || 0))) {
      return NextResponse.json({ error: "You have reached the maximum number of jobs for your plan" }, { status: 400 });
    }

    const career = {
      id: guid(),
      jobTitle,
      description,
      questions,
      location,
      workSetup,
      workSetupRemarks,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy,
      createdBy,
      status: status || "active",
      cvScreeningSetting,
      aiInterviewScreeningSetting,
      cvSecretPrompt,
      aiInterviewSecretPrompt,
      preScreeningQuestions,
      orgID,
      requireVideo,
      lastActivityAt: new Date(),
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country,
      province,
      employmentType,
    };

    await db.collection("careers").insertOne(career);

    return NextResponse.json({
      message: "Career added successfully",
      career,
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career" },
      { status: 500 }
    );
  }
}
