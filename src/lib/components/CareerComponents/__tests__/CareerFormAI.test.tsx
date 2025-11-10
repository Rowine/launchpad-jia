import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CareerFormAI from '../CareerFormAI';

jest.mock('../CustomDropdown', () => {
  return function MockCustomDropdown({
    onSelectSetting,
    screeningSetting,
    settingList,
    placeholder,
    error,
  }: any) {
    return (
      <select
        data-testid={`mock-dropdown-${placeholder}`}
        value={screeningSetting}
        onChange={(e) => onSelectSetting(e.target.value)}
        aria-invalid={error ? 'true' : 'false'}
      >
        <option value="">{placeholder}</option>
        {settingList.map((item: any) => (
          <option key={item.name ?? item} value={item.name ?? item}>
            {item.name ?? item}
          </option>
        ))}
      </select>
    );
  };
});

const mockSetQuestions = jest.fn();

jest.mock('../InterviewQuestionGeneratorV2', () => {
  return function MockInterviewQuestionGenerator({
    questions,
    setQuestions,
    errorMessage,
  }: any) {
    return (
      <div data-testid="mock-question-generator">
        <span data-testid="mock-question-count">{questions.length}</span>
        {errorMessage ? <p>{errorMessage}</p> : null}
        <button
          type="button"
          onClick={() =>
            setQuestions([
              {
                id: 1,
                category: 'Technical',
                questions: [{ id: 1, question: 'Sample question?' }],
              },
            ])
          }
        >
          Add Question
        </button>
      </div>
    );
  };
});

const defaultProps = {
  questions: [],
  setQuestions: mockSetQuestions,
  requireVideo: false,
  setRequireVideo: jest.fn(),
  screeningSetting: 'Good Fit and above',
  setScreeningSetting: jest.fn(),
  screeningSettingList: [{ name: 'Good Fit and above' }, { name: 'Only Strong Fit' }],
  jobTitle: 'Software Engineer',
  description: 'Build and maintain applications.',
  aiQuestionsError: '',
  aiInterviewSecretPrompt: '',
  setAiInterviewSecretPrompt: jest.fn(),
};

const renderComponent = (override: Partial<typeof defaultProps> = {}) =>
  render(<CareerFormAI {...defaultProps} {...override} />);

describe('CareerFormAI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders headings and sections', () => {
    renderComponent();

    expect(screen.getByText('1. AI Interview Settings')).toBeInTheDocument();
    expect(screen.getByText('AI Interview Screening')).toBeInTheDocument();
    expect(screen.getByText('Require Video on Interview')).toBeInTheDocument();
    expect(screen.getByText('AI Interview Secret Prompt')).toBeInTheDocument();
  });

  it('calls setScreeningSetting when dropdown changes', () => {
    renderComponent();

    const dropdown = screen.getByTestId('mock-dropdown-Choose screening setting');
    fireEvent.change(dropdown, { target: { value: 'Only Strong Fit' } });

    expect(defaultProps.setScreeningSetting).toHaveBeenCalledWith('Only Strong Fit');
  });

  it('toggles requireVideo when switch is clicked', () => {
    renderComponent({ requireVideo: false });

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(defaultProps.setRequireVideo).toHaveBeenCalledWith(true);
  });

  it('displays correct require video label based on state', () => {
    const { rerender } = renderComponent({ requireVideo: false });

    expect(screen.getByText('No')).toBeInTheDocument();

    rerender(<CareerFormAI {...defaultProps} requireVideo />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('updates secret prompt textarea', () => {
    renderComponent();

    const textarea = screen.getByPlaceholderText(/Enter a secret prompt/i);
    fireEvent.change(textarea, { target: { value: 'New secret prompt' } });

    expect(defaultProps.setAiInterviewSecretPrompt).toHaveBeenCalledWith('New secret prompt');
  });

  it('displays aiQuestionsError when provided', () => {
    renderComponent({ aiQuestionsError: 'Please add at least 5 questions' });

    expect(screen.getByText('Please add at least 5 questions')).toBeInTheDocument();
  });

  it('passes questions to InterviewQuestionGeneratorV2 and handles setQuestions', () => {
    renderComponent();

    const addQuestionButton = screen.getByRole('button', { name: 'Add Question' });
    fireEvent.click(addQuestionButton);

    expect(mockSetQuestions).toHaveBeenCalledWith([
      {
        id: 1,
        category: 'Technical',
        questions: [{ id: 1, question: 'Sample question?' }],
      },
    ]);
  });
});

