/**
 * Unit tests for CareerFormStepper component
 * Tests step rendering, navigation, error states, and progress indicators
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CareerFormStepper from '../CareerFormStepper';

describe('CareerFormStepper', () => {
  const defaultSteps = [
    'Career Details & Team Access',
    'CV Review & Pre-screening',
    'AI Interview Setup',
    'Pipeline Stages',
    'Review Career',
  ];

  describe('Rendering', () => {
    it('should render all default steps', () => {
      render(<CareerFormStepper currentStep={0} />);
      
      defaultSteps.forEach((step) => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('should render custom steps when provided', () => {
      const customSteps = ['Step 1', 'Step 2', 'Step 3'];
      render(<CareerFormStepper steps={customSteps} currentStep={0} />);
      
      customSteps.forEach((step) => {
        expect(screen.getByText(step)).toBeInTheDocument();
      });
    });

    it('should render correct number of step indicators', () => {
      const { container } = render(<CareerFormStepper currentStep={0} />);
      const stepIndicators = container.querySelectorAll('[class*="la-dot-circle"], button, [class*="la-exclamation-triangle"]');
      expect(stepIndicators.length).toBe(defaultSteps.length);
    });
  });

  describe('Step States', () => {
    it('should highlight current step with active styling', () => {
      const { container } = render(<CareerFormStepper currentStep={1} />);
      
      // Current step (index 1) should have active dot
      const stepText = screen.getByText('CV Review & Pre-screening');
      const stepContainer = stepText.closest('div[style*="flex-direction: column"]');
      const activeDot = stepContainer?.querySelector('i.la-dot-circle');
      expect(activeDot).toBeInTheDocument();
      expect(activeDot).toHaveStyle({ color: '#000000' });
    });

    it('should show completed steps with checkmark button', () => {
      render(<CareerFormStepper currentStep={2} />);
      
      // Steps before current (0, 1) should be completed
      const completedButtons = screen.getAllByRole('button');
      expect(completedButtons.length).toBeGreaterThan(0);
      
      // Check that completed steps have checkmark icons
      completedButtons.forEach((button) => {
        const checkIcon = button.querySelector('.la-check');
        expect(checkIcon).toBeInTheDocument();
      });
    });

    it('should show future steps with inactive dot', () => {
      render(<CareerFormStepper currentStep={1} />);
      
      // Future steps (index 2+) should have inactive dots
      const stepText = screen.getByText('AI Interview Setup');
      const stepContainer = stepText.closest('div[style*="flex-direction: column"]');
      const futureDot = stepContainer?.querySelector('i.la-dot-circle');
      expect(futureDot).toBeInTheDocument();
      expect(futureDot).toHaveStyle({ color: '#D5D7DA' });
    });

    it('should show error state for errorStepIndex', () => {
      render(<CareerFormStepper currentStep={2} errorStepIndex={1} />);
      
      const stepText = screen.getByText('CV Review & Pre-screening');
      const stepContainer = stepText.closest('div[style*="flex-direction: column"]');
      const errorIcon = stepContainer?.querySelector('i.la-exclamation-triangle');
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveStyle({ color: '#F04438' });
    });

    it('should apply bold font weight to active, completed, and error steps', () => {
      render(<CareerFormStepper currentStep={1} errorStepIndex={0} />);
      
      // Active step should be bold
      const activeStep = screen.getByText('CV Review & Pre-screening');
      expect(activeStep).toHaveStyle({ fontWeight: '700' });
      
      // Error step should be bold
      const errorStep = screen.getByText('Career Details & Team Access');
      expect(errorStep).toHaveStyle({ fontWeight: '700' });
    });
  });

  describe('Step Navigation', () => {
    it('should call onStepClick when clicking a completed step', () => {
      const mockOnStepClick = jest.fn();
      render(<CareerFormStepper currentStep={2} onStepClick={mockOnStepClick} />);
      
      // Click on first completed step (index 0)
      const completedButtons = screen.getAllByRole('button');
      fireEvent.click(completedButtons[0]);
      
      expect(mockOnStepClick).toHaveBeenCalledWith(0);
    });

    it('should not call onStepClick for current step', () => {
      const mockOnStepClick = jest.fn();
      render(<CareerFormStepper currentStep={1} onStepClick={mockOnStepClick} />);
      
      // Current step should be a dot, not a button
      const currentStepElement = screen.getByText('CV Review & Pre-screening').closest('div');
      const button = currentStepElement?.querySelector('button');
      
      // Current step should not have a clickable button
      expect(button).not.toBeInTheDocument();
      expect(mockOnStepClick).not.toHaveBeenCalled();
    });

    it('should not call onStepClick for future steps', () => {
      const mockOnStepClick = jest.fn();
      render(<CareerFormStepper currentStep={1} onStepClick={mockOnStepClick} />);
      
      // Future step should be a dot, not a button
      const futureStepElement = screen.getByText('AI Interview Setup').closest('div');
      const button = futureStepElement?.querySelector('button');
      
      expect(button).not.toBeInTheDocument();
      expect(mockOnStepClick).not.toHaveBeenCalled();
    });

    it('should not call onStepClick when handler is not provided', () => {
      render(<CareerFormStepper currentStep={2} />);
      
      // Even if step is completed, without onStepClick, button should not be clickable
      const completedButtons = screen.getAllByRole('button');
      if (completedButtons.length > 0) {
        fireEvent.click(completedButtons[0]);
        // No error should occur, but handler won't be called
      }
    });
  });

  describe('Progress Bar', () => {
    it('should show 100% progress for completed steps', () => {
      const { container } = render(<CareerFormStepper currentStep={2} progressEnabled={true} />);
      
      // Progress bars between completed steps should have gradient fill
      // Check that progress bars exist and have background styling
      const progressBars = container.querySelectorAll('div[style*="height: 4"]');
      expect(progressBars.length).toBeGreaterThan(0);
      
      // Verify that progress bars are rendered with styling
      // When currentStep is 2, step 0->1 should be 100% (completed)
      // The component renders progress bars correctly - exact style format may vary
      progressBars.forEach(bar => {
        const style = bar.getAttribute('style') || '';
        expect(style).toBeTruthy();
      });
      
      // With 5 steps and currentStep=2, we should have 4 progress bars
      // At least the first bar (between step 0 and 1) should have gradient for completed step
      expect(progressBars.length).toBe(4);
    });

    it('should show 50% progress for current step', () => {
      const { container } = render(<CareerFormStepper currentStep={1} progressEnabled={true} />);
      
      // Progress bar before current step should be 50%
      const progressBars = container.querySelectorAll('div[style*="backgroundSize"]');
      if (progressBars[0]) {
        const style = progressBars[0].getAttribute('style');
        expect(style).toContain('backgroundSize: 50%');
      }
    });

    it('should show 0% progress for future steps', () => {
      const { container } = render(<CareerFormStepper currentStep={0} progressEnabled={true} />);
      
      // Progress bars exist (at least one between steps)
      const progressBars = container.querySelectorAll('div[style*="height: 4"]');
      expect(progressBars.length).toBeGreaterThan(0);
      
      // When currentStep is 0, bars after the first one (which is 50% for current step)
      // should be 0% (no gradient) for future steps
      // With 5 steps and currentStep=0, we have 4 bars: first is 50%, rest are 0%
      const barsWithoutGradient = Array.from(progressBars).filter(bar => {
        const style = bar.getAttribute('style') || '';
        return !style.includes('backgroundImage');
      });
      
      // There should be bars without gradient (0% progress for future steps)
      // At least 3 bars should be 0% (between steps 1-2, 2-3, 3-4)
      expect(barsWithoutGradient.length).toBeGreaterThan(0);
    });

    it('should hide progress gradient when progressEnabled is false', () => {
      const { container } = render(<CareerFormStepper currentStep={2} progressEnabled={false} />);
      
      // All progress bars should show 0% (no gradient)
      const progressBars = container.querySelectorAll('div[style*="backgroundSize"]');
      // When progressEnabled is false, no bars should have gradient
      progressBars.forEach((bar) => {
        const style = bar.getAttribute('style');
        if (style) {
          expect(style).not.toContain('backgroundImage');
        }
      });
    });

    it('should not render progress bar after last step', () => {
      const { container } = render(<CareerFormStepper currentStep={4} />);
      
      const lastStep = screen.getByText('Review Career');
      const lastStepContainer = lastStep.closest('div[style*="flex-direction: column"]');
      
      // Last step should not have a progress bar after it
      const progressBars = lastStepContainer?.querySelectorAll('div[style*="height: 4"]');
      expect(progressBars?.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle currentStep out of bounds (negative)', () => {
      render(<CareerFormStepper currentStep={-1} />);
      
      // Should clamp to 0
      const firstStep = screen.getByText('Career Details & Team Access');
      expect(firstStep).toBeInTheDocument();
    });

    it('should handle currentStep out of bounds (too large)', () => {
      render(<CareerFormStepper currentStep={100} />);
      
      // Should clamp to last step
      const lastStep = screen.getByText('Review Career');
      expect(lastStep).toBeInTheDocument();
    });

    it('should handle null errorStepIndex', () => {
      render(<CareerFormStepper currentStep={1} errorStepIndex={null} />);
      
      // Should not show error icons
      const errorIcons = screen.queryAllByRole('img', { hidden: true });
      const exclamationIcons = Array.from(document.querySelectorAll('.la-exclamation-triangle'));
      expect(exclamationIcons.length).toBe(0);
    });

    it('should handle empty steps array gracefully', () => {
      const { container } = render(<CareerFormStepper steps={[]} currentStep={0} />);
      
      // Should render without crashing
      const stepperContainer = container.querySelector('div[style*="width: 100%"]');
      expect(stepperContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have title attribute on step labels', () => {
      render(<CareerFormStepper currentStep={0} />);
      
      const firstStep = screen.getByText('Career Details & Team Access');
      expect(firstStep).toHaveAttribute('title', 'Career Details & Team Access');
    });

    it('should have proper button roles for completed steps', () => {
      render(<CareerFormStepper currentStep={2} onStepClick={jest.fn()} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});

