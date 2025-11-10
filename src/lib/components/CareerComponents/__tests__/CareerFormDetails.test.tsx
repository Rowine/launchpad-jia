import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CareerFormDetails from '../CareerFormDetails';

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

jest.mock('../RichTextEditor', () => {
  return function MockRichTextEditor({ setText, text, hasError }: any) {
    return (
      <textarea
        data-testid="mock-rich-text-editor"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-invalid={hasError ? 'true' : 'false'}
      />
    );
  };
});

const defaultProps = {
  value: {
    jobTitle: 'Software Engineer',
    employmentType: 'Full-time',
    workSetup: 'Remote',
    country: 'Philippines',
    province: 'Metro Manila',
    city: 'Makati',
    salaryNegotiable: false,
    minimumSalary: 50000,
    maximumSalary: 100000,
  },
  onChange: jest.fn(),
  employmentTypeOptions: [{ name: 'Full-time' }, { name: 'Part-time' }],
  workSetupOptions: [{ name: 'Remote' }, { name: 'Hybrid' }],
  countryOptions: [{ name: 'Philippines' }, { name: 'Singapore' }],
  provinceList: [{ name: 'Metro Manila' }],
  cityList: [{ name: 'Makati' }],
  description: 'Job description',
  setDescription: jest.fn(),
  teamMembers: [
    {
      name: 'Alice',
      email: 'alice@example.com',
      role: 'Job Owner',
      isYou: true,
    },
    {
      name: 'Bob',
      email: 'bob@example.com',
      role: 'Collaborator',
      isYou: false,
    },
  ],
  setTeamMembers: jest.fn(),
  teamRoleOptions: [{ name: 'Job Owner' }, { name: 'Collaborator' }],
  errors: {},
};

const renderComponent = (overrideProps = {}) =>
  render(<CareerFormDetails {...defaultProps} {...overrideProps} />);

describe('CareerFormDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders headings and key sections', () => {
    renderComponent();

    expect(screen.getByText('1. Career Information')).toBeInTheDocument();
    expect(screen.getByText('2. Job Description')).toBeInTheDocument();
    expect(screen.getByText('3. Team Access')).toBeInTheDocument();
  });

  it('calls onChange when job title changes', () => {
    renderComponent();

    const jobTitleInput = screen.getByPlaceholderText('Enter job title');
    fireEvent.change(jobTitleInput, { target: { value: 'Senior Engineer' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({ jobTitle: 'Senior Engineer' });
  });

  it('displays validation errors when provided', () => {
    renderComponent({
      errors: {
        jobTitle: 'Job title is required',
        employmentType: 'Select employment type',
      },
    });

    expect(screen.getByText('Job title is required')).toBeInTheDocument();
    expect(screen.getByText('Select employment type')).toBeInTheDocument();
  });

  it('disables salary inputs when salary is negotiable', () => {
    renderComponent({
      value: { ...defaultProps.value, salaryNegotiable: true },
    });

    const [minSalaryInput, maxSalaryInput] = screen.getAllByPlaceholderText('0');

    expect(minSalaryInput).toBeDisabled();
    expect(maxSalaryInput).toBeDisabled();
  });

  it('enables salary inputs when salary is fixed', () => {
    renderComponent({
      value: { ...defaultProps.value, salaryNegotiable: false },
    });

    const [minSalaryInput, maxSalaryInput] = screen.getAllByPlaceholderText('0');

    expect(minSalaryInput).not.toBeDisabled();
    expect(maxSalaryInput).not.toBeDisabled();
  });

  it('toggles salaryNegotiable when switch is clicked', () => {
    renderComponent({
      value: { ...defaultProps.value, salaryNegotiable: false },
    });

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    expect(defaultProps.onChange).toHaveBeenCalledWith({ salaryNegotiable: true });
  });

  it('calls setDescription when description changes', () => {
    renderComponent();

    const richTextEditor = screen.getByTestId('mock-rich-text-editor');
    fireEvent.change(richTextEditor, { target: { value: 'Updated description' } });

    expect(defaultProps.setDescription).toHaveBeenCalledWith('Updated description');
  });

  it('calls setTeamMembers when team member role changes', () => {
    renderComponent();

    const roleDropdowns = screen.getAllByTestId(/mock-dropdown-Select role/i);
    fireEvent.change(roleDropdowns[1], { target: { value: 'Job Owner' } });

    expect(defaultProps.setTeamMembers).toHaveBeenCalled();
  });

  it('calls setTeamMembers when deleting a team member', () => {
    const { container } = renderComponent();

    const deleteButtons = Array.from(container.querySelectorAll('button')).filter((button) =>
      button.querySelector('.la-trash'),
    );

    const enabledDeleteButton = deleteButtons.find((button) => !button.hasAttribute('disabled'));
    expect(enabledDeleteButton).toBeDefined();

    if (enabledDeleteButton) {
      fireEvent.click(enabledDeleteButton);
      expect(defaultProps.setTeamMembers).toHaveBeenCalled();
    }
  });

  it('disables delete button for current user', () => {
    const { container } = renderComponent();

    const deleteButtons = Array.from(container.querySelectorAll('button')).filter((button) =>
      button.querySelector('.la-trash'),
    );

    const disabledButton = deleteButtons.find((button) => button.hasAttribute('disabled'));
    expect(disabledButton).toBeDefined();
  });
});

