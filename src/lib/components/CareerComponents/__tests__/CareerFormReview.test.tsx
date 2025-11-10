import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CareerFormReview from '../CareerFormReview';

const defaultSummary = {
  jobTitle: 'Software Engineer',
  employmentType: 'Full-time',
  workSetup: 'Remote',
  country: 'Philippines',
  province: 'Metro Manila',
  city: 'Makati',
  salaryNegotiable: false,
  minimumSalary: 50000,
  maximumSalary: 100000,
  description: '<p>Build and maintain applications.</p>',
  teamMembers: [
    { name: 'Alice', email: 'alice@example.com', role: 'Job Owner', isYou: true },
    { name: 'Bob', email: 'bob@example.com', role: 'Collaborator' },
  ],
  cvScreeningSetting: 'Strong Fit',
  cvSecretPrompt: 'Focus on detail.\nEnsure clarity.',
  preScreeningQuestions: [
    {
      id: 1,
      question: 'Notice period?',
      type: 'Dropdown',
      options: [{ id: 1, value: 'Immediate' }],
    },
    {
      id: 2,
      question: 'Salary expectations?',
      type: 'Range',
      minimumRange: '40000',
      maximumRange: '60000',
    },
  ],
  questions: [
    {
      id: 1,
      category: 'Technical',
      questions: [{ id: 1, question: 'Explain event loop.' }],
    },
  ],
  aiInterviewScreeningSetting: 'Strong Fit',
  requireVideo: true,
  aiInterviewSecretPrompt: 'Evaluate tone. Ensure clarity.',
};

const renderComponent = (summaryOverrides: Partial<typeof defaultSummary> = {}) => {
  const summary = { ...defaultSummary, ...summaryOverrides };
  const onEditStep = jest.fn();

  const utils = render(<CareerFormReview summary={summary} onEditStep={onEditStep} />);
  return { ...utils, summary, onEditStep };
};

describe('CareerFormReview', () => {
  it('renders key sections', () => {
    renderComponent();

    expect(screen.getByText('Career Details & Team Access')).toBeInTheDocument();
    expect(screen.getByText('CV Review & Pre-Screening Questions')).toBeInTheDocument();
    expect(screen.getByText('AI Interview Setup')).toBeInTheDocument();
  });

  it('displays job details and salaries', () => {
    renderComponent();

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Full-time')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('Philippines')).toBeInTheDocument();
    expect(screen.getByText('Metro Manila')).toBeInTheDocument();
    expect(screen.getByText('Makati')).toBeInTheDocument();

    const minSalaryLabel = screen.getByText('Minimum Salary');
    const maxSalaryLabel = screen.getByText('Maximum Salary');

    const minSalary = minSalaryLabel.parentElement as HTMLElement;
    const maxSalary = maxSalaryLabel.parentElement as HTMLElement;

    expect(minSalary).toHaveTextContent('₱50,000');
    expect(maxSalary).toHaveTextContent('₱100,000');
  });

  it('formats salary as negotiable when applicable', () => {
    renderComponent({ salaryNegotiable: true, minimumSalary: 0, maximumSalary: 0 });

    const negotiableBadges = screen.getAllByText('Negotiable');
    expect(negotiableBadges.length).toBeGreaterThanOrEqual(2);
  });

  it('renders CV secret prompts as bullet points', () => {
    renderComponent({
      cvSecretPrompt: 'Focus on detail.\nEnsure clarity.',
    });

    const focusItems = screen.getAllByText('Focus on detail.');
    const clarityItems = screen.getAllByText('Ensure clarity.');

    expect(focusItems.length).toBeGreaterThan(0);
    expect(clarityItems.length).toBeGreaterThan(0);
  });

  it('shows pre-screening question count and details', () => {
    renderComponent();

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/Notice period\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Salary expectations\?/i)).toBeInTheDocument();
    expect(screen.getByText('Preferred: PHP 40,000 - PHP 60,000')).toBeInTheDocument();
  });

  it('shows AI interview question count and categories', () => {
    renderComponent();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Technical')).toBeInTheDocument();
    expect(screen.getByText(/Explain event loop\./i)).toBeInTheDocument();
  });

  it('renders team members', () => {
    renderComponent();

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('shows fallback when no team members provided', () => {
    renderComponent({ teamMembers: [] });

    expect(screen.getByText('No team members added')).toBeInTheDocument();
  });

  it('calls onEditStep when pencil icons clicked', () => {
    const { onEditStep } = renderComponent();

    const pencilIcons = Array.from(document.querySelectorAll('.la-pencil'));
    expect(pencilIcons.length).toBe(3);

    fireEvent.click(pencilIcons[0]);
    expect(onEditStep).toHaveBeenCalledWith(1);

    fireEvent.click(pencilIcons[1]);
    expect(onEditStep).toHaveBeenCalledWith(2);

    fireEvent.click(pencilIcons[2]);
    expect(onEditStep).toHaveBeenCalledWith(3);
  });

  it('collapses and expands sections when headers clicked', () => {
    renderComponent();

    const detailsHeader = screen.getByText('Career Details & Team Access');
    fireEvent.click(detailsHeader);
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();

    fireEvent.click(detailsHeader);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('displays AI interview secret prompts and require video status', () => {
    renderComponent({
      aiInterviewSecretPrompt: 'Evaluate tone. Ensure clarity.',
      requireVideo: true,
    });

    const evaluateTexts = screen.getAllByText('Evaluate tone.');
    const clarityTexts = screen.getAllByText('Ensure clarity.');

    expect(evaluateTexts.length).toBeGreaterThan(0);
    expect(clarityTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('handles empty pre-screening questions gracefully', () => {
    renderComponent({ preScreeningQuestions: [] });

    expect(screen.getByText('No pre-screening questions added yet.')).toBeInTheDocument();
  });

  it('handles empty AI interview questions gracefully', () => {
    renderComponent({ questions: [] });

    expect(screen.getByText('No AI interview questions added yet.')).toBeInTheDocument();
  });

  it('renders summary description HTML', () => {
    renderComponent({ description: '<p>Role overview</p>' });

    expect(screen.getByText('Role overview')).toBeInTheDocument();
  });
});

