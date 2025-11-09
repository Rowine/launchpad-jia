/**
 * Sanitization utilities for XSS protection
 */

/**
 * Removes all HTML tags and returns plain text
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

/**
 * Sanitizes HTML by removing dangerous tags and attributes
 * Allows only safe formatting tags
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove event handlers (onclick, onerror, etc.)
  html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  html = html.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");
  
  // Remove javascript: protocol
  html = html.replace(/javascript:/gi, "");
  
  // Remove data: URLs that could contain scripts
  html = html.replace(/data:text\/html/gi, "");
  
  // Remove iframe tags
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  
  // Remove object and embed tags
  html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");
  html = html.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");
  
  // Remove style tags
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  
  // Remove link tags
  html = html.replace(/<link\b[^>]*>/gi, "");
  
  // Remove meta tags
  html = html.replace(/<meta\b[^>]*>/gi, "");
  
  // Remove dangerous attributes from remaining tags
  html = html.replace(/\s*(?:href|src|action|formaction)\s*=\s*["']javascript:/gi, "");
  
  return html.trim();
}

/**
 * Validates and sanitizes a string field
 */
export function sanitizeString(value: any, maxLength: number = 10000): string {
  if (value === null || value === undefined) return "";
  const str = String(value).trim();
  if (str.length > maxLength) {
    throw new Error(`Field exceeds maximum length of ${maxLength} characters`);
  }
  return str;
}

/**
 * Validates and sanitizes HTML content
 */
export function sanitizeHtmlContent(value: any, maxLength: number = 50000): string {
  const str = sanitizeString(value, maxLength);
  return sanitizeHtml(str);
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates that a value is a valid number
 */
export function validateNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

/**
 * Validates that a value is a boolean
 */
export function validateBoolean(value: any): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return Boolean(value);
}

/**
 * Validates ObjectId format
 */
export function validateObjectId(id: any): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validates that a value is one of the allowed options
 */
export function validateEnum(value: any, allowedValues: string[]): boolean {
  if (!value || typeof value !== "string") return false;
  return allowedValues.includes(value);
}

/**
 * Sanitizes user info object
 */
export function sanitizeUserInfo(userInfo: any): { name: string; email: string; image?: string } {
  if (!userInfo || typeof userInfo !== "object") {
    throw new Error("Invalid user info");
  }

  const name = sanitizeString(userInfo.name, 200);
  const email = sanitizeString(userInfo.email, 200);
  
  if (!name || name.length < 1) {
    throw new Error("User name is required");
  }
  
  if (!email || !validateEmail(email)) {
    throw new Error("Valid user email is required");
  }

  const image = userInfo.image ? sanitizeString(userInfo.image, 500) : undefined;

  return { name, email, image };
}

/**
 * Validates and sanitizes questions array
 */
export function sanitizeQuestions(questions: any): any[] {
  if (!Array.isArray(questions)) {
    throw new Error("Questions must be an array");
  }

  if (questions.length > 100) {
    throw new Error("Too many question categories");
  }

  return questions.map((question, index) => {
    if (typeof question !== "object" || question === null) {
      throw new Error(`Invalid question at index ${index}`);
    }

    const sanitized: any = {
      id: validateNumber(question.id) || index + 1,
      category: sanitizeString(question.category || "", 200),
      questionCountToAsk: question.questionCountToAsk !== null && question.questionCountToAsk !== undefined
        ? validateNumber(question.questionCountToAsk)
        : null,
      questions: [],
    };

    if (Array.isArray(question.questions)) {
      if (question.questions.length > 50) {
        throw new Error(`Too many questions in category ${index}`);
      }
      sanitized.questions = question.questions.map((q: any, qIndex: number) => {
        if (typeof q !== "object" || q === null) {
          throw new Error(`Invalid question item at category ${index}, question ${qIndex}`);
        }
        // Sanitize question text (may contain HTML from rich text editor)
        const questionText = q.question || "";
        const sanitizedQuestion = questionText.includes("<") 
          ? sanitizeHtmlContent(questionText, 1000)
          : sanitizeString(questionText, 1000);
        
        return {
          id: validateNumber(q.id) || qIndex + 1,
          question: sanitizedQuestion,
          answer: q.answer ? (q.answer.includes("<") ? sanitizeHtmlContent(q.answer, 5000) : sanitizeString(q.answer, 5000)) : undefined,
        };
      });
    }

    return sanitized;
  });
}

/**
 * Validates and sanitizes pre-screening questions array (CV form)
 */
export function sanitizePreScreeningQuestions(items: any): any[] {
  if (!items) return [];
  if (!Array.isArray(items)) {
    throw new Error("Pre-screening questions must be an array");
  }
  if (items.length > 100) {
    throw new Error("Too many pre-screening questions");
  }
  return items.map((item: any, index: number) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Invalid pre-screening question at index ${index}`);
    }
    const sanitized: any = {
      id: validateNumber(item.id) || index + 1,
      suggestedId: item.suggestedId ? sanitizeString(item.suggestedId, 200) : null,
      question: sanitizeString(item.question || "", 1000),
      type: sanitizeString(item.type || "Dropdown", 100),
    };

    if (sanitized.type === "Range") {
      sanitized.minimumRange = sanitizeString(item.minimumRange ?? "", 100);
      sanitized.maximumRange = sanitizeString(item.maximumRange ?? "", 100);
    } else {
      const options = Array.isArray(item.options) ? item.options : [];
      if (options.length > 50) {
        throw new Error(`Too many options in pre-screening question at index ${index}`);
      }
      sanitized.options = options.map((opt: any, optIndex: number) => ({
        id: validateNumber(opt?.id) || optIndex + 1,
        value: sanitizeString(opt?.value || "", 500),
      }));
    }

    return sanitized;
  });
}

