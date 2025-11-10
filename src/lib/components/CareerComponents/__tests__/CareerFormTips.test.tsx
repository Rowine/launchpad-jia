import React from 'react';
import { render, screen } from '@testing-library/react';
import CareerFormTips from '../CareerFormTips';

describe('CareerFormTips', () => {
  it('renders provided titles and descriptions', () => {
    const titles = ['Use clear titles', 'Keep it concise'];
    const descriptions = [
      'so applicants immediately understand the role.',
      'to make listings easy to scan.',
    ];

    render(<CareerFormTips titles={titles} descriptions={descriptions} />);

    titles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
    descriptions.forEach((description) => {
      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  it('handles empty lists without rendering tip items', () => {
    const { container } = render(<CareerFormTips titles={[]} descriptions={[]} />);

    const tipItems = container.querySelectorAll('p');
    expect(tipItems.length).toBe(0);
  });
});

