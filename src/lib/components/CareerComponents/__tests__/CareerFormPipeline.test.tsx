import React from 'react';
import { render, screen } from '@testing-library/react';
import CareerFormPipeline from '../CareerFormPipeline';

jest.mock('../CustomDropdown', () => {
  return function MockCustomDropdown() {
    return <div data-testid="mock-dropdown" />;
  };
});

const defaultProps = {
  teamMembers: [],
  setTeamMembers: jest.fn(),
  teamRoleOptions: [{ name: 'Job Owner' }, { name: 'Collaborator' }],
};

describe('CareerFormPipeline', () => {
  it('renders container structure without crashing', () => {
    const { container } = render(<CareerFormPipeline {...defaultProps} />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders when team members are provided', () => {
    const teamMembers = [
      { name: 'Alice', email: 'alice@example.com', role: 'Job Owner' },
      { name: 'Bob', email: 'bob@example.com', role: 'Collaborator' },
    ];

    const { container } = render(
      <CareerFormPipeline {...defaultProps} teamMembers={teamMembers} />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});

