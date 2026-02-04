import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SupplySearch from '@/app/components/SupplySearch'

describe('SupplySearch Component', () => {
  const mockOnSearch = vi.fn()

  it('should render search inputs', () => {
    render(<SupplySearch onSearch={mockOnSearch} isLoading={false} />)

    expect(screen.getByLabelText('Search by supply name')).toBeDefined()
    expect(screen.getByLabelText('Search by supply code')).toBeDefined()
    expect(screen.getByText('Search Dental Supplies')).toBeDefined()
  })

  it('should show clear button when there are search values', () => {
    render(<SupplySearch onSearch={mockOnSearch} isLoading={false} />)

    const nameInput = screen.getByLabelText('Search by supply name')

    // Initially no clear button
    expect(screen.queryByText('Clear')).toBeNull()

    // Type something
    fireEvent.change(nameInput, { target: { value: 'gloves' } })

    // Clear button should appear
    expect(screen.getByText('Clear')).toBeDefined()
  })

  it('should clear both inputs when clear button is clicked', () => {
    render(<SupplySearch onSearch={mockOnSearch} isLoading={false} />)

    const nameInput = screen.getByLabelText('Search by supply name') as HTMLInputElement
    const codeInput = screen.getByLabelText('Search by supply code') as HTMLInputElement

    // Type in both inputs
    fireEvent.change(nameInput, { target: { value: 'gloves' } })
    fireEvent.change(codeInput, { target: { value: 'SUP-001' } })

    // Click clear button
    const clearButton = screen.getByText('Clear')
    fireEvent.click(clearButton)

    // Both inputs should be empty
    expect(nameInput.value).toBe('')
    expect(codeInput.value).toBe('')
  })

  it('should disable inputs when loading', () => {
    render(<SupplySearch onSearch={mockOnSearch} isLoading={true} />)

    const nameInput = screen.getByLabelText('Search by supply name') as HTMLInputElement
    const codeInput = screen.getByLabelText('Search by supply code') as HTMLInputElement

    expect(nameInput.disabled).toBe(true)
    expect(codeInput.disabled).toBe(true)
  })

  it('should show loading indicator when loading', () => {
    render(<SupplySearch onSearch={mockOnSearch} isLoading={true} />)

    expect(screen.getByText('Searching...')).toBeDefined()
    expect(screen.getByRole('status')).toBeDefined()
  })

  it('should not show loading indicator when not loading', () => {
    render(<SupplySearch onSearch={mockOnSearch} isLoading={false} />)

    expect(screen.queryByText('Searching...')).toBeNull()
  })

  it('should handle input changes', () => {
    render(<SupplySearch onSearch={mockOnSearch} isLoading={false} />)

    const nameInput = screen.getByLabelText('Search by supply name') as HTMLInputElement
    const codeInput = screen.getByLabelText('Search by supply code') as HTMLInputElement

    fireEvent.change(nameInput, { target: { value: 'needles' } })
    expect(nameInput.value).toBe('needles')

    fireEvent.change(codeInput, { target: { value: 'SUP-002' } })
    expect(codeInput.value).toBe('SUP-002')
  })
})
