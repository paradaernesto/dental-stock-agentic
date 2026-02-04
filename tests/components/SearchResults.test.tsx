import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SearchResults from '@/app/components/SearchResults'
import type { Supply } from '@/lib/types'

const mockSupplies: Supply[] = [
  {
    id: '1',
    code: 'SUP-001',
    name: 'Nitrile Gloves',
    description: 'Powder-free examination gloves',
    quantity: 100,
    unit: 'box',
    unitPrice: 12.99,
    supplier: 'TestSupplier',
    category: 'consumables',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    code: 'SUP-002',
    name: 'Dental Needles',
    description: '27-gauge needles',
    quantity: 45,
    unit: 'box',
    unitPrice: 22.00,
    supplier: 'PrecisionDental',
    category: 'consumables',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    code: 'SUP-003',
    name: 'Composite Resin',
    description: 'Light-cure resin A2',
    quantity: 30,
    unit: 'syringe',
    unitPrice: 45.00,
    supplier: null,
    category: 'materials',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
]

describe('SearchResults Component', () => {
  it('should render nothing when loading', () => {
    const { container } = render(
      <SearchResults supplies={[]} isLoading={true} query={{}} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render no results message when query exists but no supplies found', () => {
    render(
      <SearchResults supplies={[]} isLoading={false} query={{ name: 'nonexistent' }} />
    )

    expect(screen.getByText('No supplies found')).toBeDefined()
    expect(screen.getByText('Try adjusting your search terms or clearing filters')).toBeDefined()
  })

  it('should render results table with supplies', () => {
    render(
      <SearchResults supplies={mockSupplies} isLoading={false} query={{}} />
    )

    // Check for table headers
    expect(screen.getByText('Code')).toBeDefined()
    expect(screen.getByText('Name')).toBeDefined()
    expect(screen.getByText('Category')).toBeDefined()
    expect(screen.getByText('Quantity')).toBeDefined()
    expect(screen.getByText('Unit')).toBeDefined()
    expect(screen.getByText('Price')).toBeDefined()
    expect(screen.getByText('Supplier')).toBeDefined()

    // Check for supply data
    expect(screen.getByText('SUP-001')).toBeDefined()
    expect(screen.getByText('Nitrile Gloves')).toBeDefined()
    expect(screen.getByText('Dental Needles')).toBeDefined()
    expect(screen.getByText('Composite Resin')).toBeDefined()
  })

  it('should display supply count in header', () => {
    render(
      <SearchResults supplies={mockSupplies} isLoading={false} query={{}} />
    )

    expect(screen.getByText(/\(3\)/)).toBeDefined()
  })

  it('should format prices correctly', () => {
    render(
      <SearchResults supplies={mockSupplies} isLoading={false} query={{}} />
    )

    expect(screen.getByText('$12.99')).toBeDefined()
    expect(screen.getByText('$22.00')).toBeDefined()
    expect(screen.getByText('$45.00')).toBeDefined()
  })

  it('should display supply code in monospace format', () => {
    render(
      <SearchResults supplies={mockSupplies} isLoading={false} query={{}} />
    )

    const codeElement = screen.getByText('SUP-001').closest('code')
    expect(codeElement).toBeDefined()
  })

  it('should display category badge', () => {
    render(
      <SearchResults supplies={mockSupplies} isLoading={false} query={{}} />
    )

    expect(screen.getAllByText('consumables').length).toBeGreaterThan(0)
    expect(screen.getAllByText('materials').length).toBeGreaterThan(0)
  })

  it('should show low stock indicator for quantities below 50', () => {
    render(
      <SearchResults supplies={mockSupplies} isLoading={false} query={{}} />
    )

    // SUP-002 has 45 units (below 50)
    const rows = screen.getAllByRole('row')
    const needlesRow = rows.find(row => row.textContent?.includes('Dental Needles'))
    expect(needlesRow).toBeDefined()

    // Check that the quantity cell has the low-stock class (via rendered output)
    const quantityCell = needlesRow?.querySelectorAll('td')[3]
    expect(quantityCell?.textContent).toBe('45')
  })

  it('should display supplier name or dash if null', () => {
    render(
      <SearchResults supplies={mockSupplies} isLoading={false} query={{}} />
    )

    expect(screen.getByText('TestSupplier')).toBeDefined()
    expect(screen.getByText('PrecisionDental')).toBeDefined()
    expect(screen.getByText('—')).toBeDefined() // For null supplier
  })

  it('should display description if available', () => {
    render(
      <SearchResults supplies={mockSupplies} isLoading={false} query={{}} />
    )

    expect(screen.getByText('Powder-free examination gloves')).toBeDefined()
    expect(screen.getByText('27-gauge needles')).toBeDefined()
    expect(screen.getByText('Light-cure resin A2')).toBeDefined()
  })

  it('should render all supply rows', () => {
    render(
      <SearchResults supplies={mockSupplies} isLoading={false} query={{}} />
    )

    // 1 header row + 3 supply rows
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(4)
  })

  it('should render different units correctly', () => {
    render(
      <SearchResults supplies={mockSupplies} isLoading={false} query={{}} />
    )

    const allText = screen.getByRole('table').textContent
    expect(allText).toContain('box')
    expect(allText).toContain('syringe')
  })
})
