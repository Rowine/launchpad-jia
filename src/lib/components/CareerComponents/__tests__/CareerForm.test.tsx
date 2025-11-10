import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CareerForm from '../CareerForm';

jest.mock('@/lib/context/AppContext', () => ({
  useAppContext: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/hooks/useCareerFormState', () => ({
  useCareerFormState: jest.fn(),
}));

jest.mock('@/lib/hooks/useCareerFormSteps', () => ({
  getStepFromUrl: jest.fn(),
  setStepInUrl: jest.fn(),
  writeDraft: jest.fn(),
  clearDraft: jest.fn(),
}));

jest.mock('@/lib/utils/careerFormValidation', () => ({
  validateStep: jest.fn(),
  validateStepResult: jest.fn(),
}));

jest.mock('@/lib/utils/careerService', () => ({
  CareerService: {
    validateBeforeSave: jest.fn(),
    buildCareerPayload: jest.fn(),
    createCareer: jest.fn(),
    updateCareer: jest.fn(),
  },
}));

jest.mock('@/lib/Utils', () => ({
  candidateActionToast: jest.fn(),
  errorToast: jest.fn(),
}));

const mockStepperProps: { lastProps: any } = { lastProps: null };
jest.mock('@/lib/components/CareerComponents/CareerFormStepper', () => (props: any) => {
  mockStepperProps.lastProps = props;
  return (
    <div data-testid="mock-stepper" onClick={() => props.onStepClick?.(props.currentStep)}>
      Stepper {props.currentStep}
    </div>
  );
});
jest.mock('@/lib/components/CareerComponents/CareerFormDetails', () => {
  const mockDetailsProps: { value: any } = { value: null };
  return (props: any) => {
    mockDetailsProps.value = props;
    return <div data-testid="details-component">Details Component</div>;
  };
});

const mockCvProps: { value: any } = { value: null };
jest.mock('@/lib/components/CareerComponents/CareerFormCV', () => (props: any) => {
  mockCvProps.value = props;
  return <div data-testid="cv-component">CV Component</div>;
});

const mockAiProps: { value: any } = { value: null };
jest.mock('@/lib/components/CareerComponents/CareerFormAI', () => (props: any) => {
  mockAiProps.value = props;
  return <div data-testid="ai-component">AI Component</div>;
});

jest.mock('@/lib/components/CareerComponents/CareerFormPipeline', () => () => (
  <div data-testid="pipeline-component">Pipeline Component</div>
));

const mockReviewProps: { value: any } = { value: null };
jest.mock('@/lib/components/CareerComponents/CareerFormReview', () => (props: any) => {
  mockReviewProps.value = props;
  return <div data-testid="review-component">Review Component</div>;
});

jest.mock('@/lib/components/CareerComponents/CareerFormTips', () => () => (
  <div data-testid="tips-component">Tips Component</div>
));

jest.mock('@/lib/components/CareerComponents/CareerActionModal', () => (props: any) => (
  <div data-testid="action-modal">
    <button type="button" onClick={() => props.onAction('active')}>
      Confirm
    </button>
  </div>
));

jest.mock('@/lib/components/CareerComponents/FullScreenLoadingAnimation', () => () => (
  <div data-testid="loading">Loading...</div>
));

const { useAppContext } = jest.requireMock('@/lib/context/AppContext');
const { useRouter } = jest.requireMock('next/navigation');
const { useCareerFormState } = jest.requireMock('@/lib/hooks/useCareerFormState');
const { getStepFromUrl, setStepInUrl, writeDraft } = jest.requireMock(
  '@/lib/hooks/useCareerFormSteps',
);
const { validateStep, validateStepResult } = jest.requireMock(
  '@/lib/utils/careerFormValidation',
);

const mockRouter = { replace: jest.fn(), push: jest.fn() };

const formState = {
  jobTitle: 'Software Engineer',
  description: '<p>Build apps</p>',
  employmentType: 'Full-time',
  workSetup: 'Remote',
  workSetupRemarks: '',
  cvScreeningSetting: 'Strong Fit',
  aiInterviewScreeningSetting: 'Strong Fit',
  cvSecretPrompt: '',
  aiInterviewSecretPrompt: '',
  requireVideo: true,
  salaryNegotiable: false,
  minimumSalary: 50000,
  maximumSalary: 100000,
  questions: [
    {
      id: 1,
      category: 'Technical',
      questions: [{ id: 1, question: 'Explain event loop' }],
    },
  ],
  preScreeningQuestions: [],
  country: 'Philippines',
  province: 'Metro Manila',
  city: 'Makati',
  teamMembers: [],
};

const uiState = {
  showSaveModal: '',
  isSavingCareer: false,
  aiQuestionsError: '',
  stepErrorIndex: null,
};

const locationData = {
  provinceList: [],
  cityList: [],
};

const updateField = jest.fn();
const updateFields = jest.fn();
const setShowSaveModal = jest.fn();
const setIsSavingCareer = jest.fn();
const setAiQuestionsError = jest.fn();
const setStepErrorIndex = jest.fn();
const setProvinceList = jest.fn();
const setCityList = jest.fn();

describe('CareerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppContext.mockReturnValue({
      user: { name: 'Jane Doe', email: 'jane@example.com' },
      orgID: 'org-1',
    });
    useRouter.mockReturnValue(mockRouter);
    useCareerFormState.mockReturnValue({
      formState,
      updateField,
      updateFields,
      uiState,
      setShowSaveModal,
      setIsSavingCareer,
      setAiQuestionsError,
      setStepErrorIndex,
      locationData,
      setProvinceList,
      setCityList,
    });
    getStepFromUrl.mockReturnValue(1);
    setStepInUrl.mockReset();
    writeDraft.mockReset();
    validateStep.mockReturnValue(true);
    validateStepResult.mockReturnValue({ valid: true });
  });

  it('renders first step details by default', () => {
    render(<CareerForm formType="add" />);

    expect(screen.getByTestId('details-component')).toBeInTheDocument();
  });

  it('moves to next step when Save and Continue succeeds', () => {
    render(<CareerForm formType="add" />);

    const button = screen.getByRole('button', { name: /Save and Continue/i });
    fireEvent.click(button);

    expect(writeDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        jobTitle: 'Software Engineer',
        description: '<p>Build apps</p>',
      }),
      'org-1',
    );
    expect(setStepInUrl).toHaveBeenCalledWith(2);
    expect(screen.getByTestId('cv-component')).toBeInTheDocument();
  });

  it('stays on current step when validation fails', () => {
    validateStepResult.mockReturnValueOnce({
      valid: false,
      errors: { jobTitle: 'Required' },
      aiQuestionsError: '',
    });

    render(<CareerForm formType="add" />);

    fireEvent.click(screen.getByRole('button', { name: /Save and Continue/i }));

    expect(setStepErrorIndex).toHaveBeenCalledWith(0);
    expect(setAiQuestionsError).not.toHaveBeenCalled();
    expect(screen.getByTestId('details-component')).toBeInTheDocument();
    expect(screen.queryByTestId('cv-component')).not.toBeInTheDocument();
  });

  it('navigates to selected step when onEditStep fired from review', async () => {
    getStepFromUrl.mockReturnValue(5);

    render(<CareerForm formType="add" />);

    expect(screen.getByTestId('review-component')).toBeInTheDocument();
    expect(mockReviewProps.value).not.toBeNull();

    await act(async () => {
      mockReviewProps.value.onEditStep(2);
    });

    expect(setStepInUrl).toHaveBeenCalledWith(2);
    expect(screen.getByTestId('cv-component')).toBeInTheDocument();
  });
});

