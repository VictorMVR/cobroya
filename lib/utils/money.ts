import { Decimal } from 'decimal.js'
import { CURRENCY_CONFIG } from './constants'

// Configure Decimal.js for precise financial calculations
Decimal.set({
  precision: 10,
  rounding: Decimal.ROUND_HALF_UP,
  toExpPos: 9e15,
  toExpNeg: -9e15,
  maxE: 9e15,
  minE: -9e15,
})

/**
 * Money utility class for precise financial calculations in CobroYa POS
 * Uses Decimal.js to avoid floating point precision issues
 */
export class Money {
  private readonly amount: Decimal

  constructor(value: number | string | Decimal) {
    this.amount = new Decimal(value)
  }

  // Arithmetic operations
  add(other: Money | number | string): Money {
    return new Money(this.amount.add(new Decimal(other instanceof Money ? other.amount : other)))
  }

  subtract(other: Money | number | string): Money {
    return new Money(this.amount.sub(new Decimal(other instanceof Money ? other.amount : other)))
  }

  multiply(other: Money | number | string): Money {
    return new Money(this.amount.mul(new Decimal(other instanceof Money ? other.amount : other)))
  }

  divide(other: Money | number | string): Money {
    return new Money(this.amount.div(new Decimal(other instanceof Money ? other.amount : other)))
  }

  // Comparison operations
  equals(other: Money | number | string): boolean {
    return this.amount.equals(new Decimal(other instanceof Money ? other.amount : other))
  }

  greaterThan(other: Money | number | string): boolean {
    return this.amount.gt(new Decimal(other instanceof Money ? other.amount : other))
  }

  lessThan(other: Money | number | string): boolean {
    return this.amount.lt(new Decimal(other instanceof Money ? other.amount : other))
  }

  greaterThanOrEqual(other: Money | number | string): boolean {
    return this.amount.gte(new Decimal(other instanceof Money ? other.amount : other))
  }

  lessThanOrEqual(other: Money | number | string): boolean {
    return this.amount.lte(new Decimal(other instanceof Money ? other.amount : other))
  }

  // Utility methods
  isZero(): boolean {
    return this.amount.isZero()
  }

  isPositive(): boolean {
    return this.amount.gt(0)
  }

  isNegative(): boolean {
    return this.amount.lt(0)
  }

  abs(): Money {
    return new Money(this.amount.abs())
  }

  // Conversion methods
  toNumber(): number {
    return this.amount.toNumber()
  }

  toString(): string {
    return this.amount.toFixed(2)
  }

  // Formatting for display
  toDisplayString(): string {
    return formatCurrency(this.toNumber())
  }

  toCents(): number {
    return this.amount.mul(100).toNumber()
  }

  static fromCents(cents: number): Money {
    return new Money(new Decimal(cents).div(100))
  }

  static zero(): Money {
    return new Money(0)
  }
}

/**
 * Format number as Mexican Peso currency
 */
export function formatCurrency(amount: number | string | Money): string {
  const value = amount instanceof Money ? amount.toNumber() : Number(amount)
  
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
    minimumFractionDigits: CURRENCY_CONFIG.minimumFractionDigits,
    maximumFractionDigits: CURRENCY_CONFIG.maximumFractionDigits,
  }).format(value)
}

/**
 * Format number for compact display (e.g., $1.2K)
 */
export function formatCurrencyCompact(amount: number | string | Money): string {
  const value = amount instanceof Money ? amount.toNumber() : Number(amount)
  
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Parse currency string to Money object
 */
export function parseCurrency(currencyString: string): Money {
  // Remove currency symbols and spaces, then parse
  const cleaned = currencyString
    .replace(/[$,\s]/g, '')
    .replace(',', '.')
  
  return new Money(cleaned)
}

/**
 * Calculate percentage of an amount
 */
export function calculatePercentage(amount: Money | number, percentage: number): Money {
  const value = amount instanceof Money ? amount : new Money(amount)
  return value.multiply(percentage / 100)
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(amount: Money | number, discountPercent: number): Money {
  return calculatePercentage(amount, discountPercent)
}

/**
 * Calculate tax amount
 */
export function calculateTax(amount: Money | number, taxPercent: number): Money {
  return calculatePercentage(amount, taxPercent)
}

/**
 * Calculate change to give back
 */
export function calculateChange(total: Money | number, paid: Money | number): Money {
  const totalMoney = total instanceof Money ? total : new Money(total)
  const paidMoney = paid instanceof Money ? paid : new Money(paid)
  return paidMoney.subtract(totalMoney)
}

/**
 * Round to nearest 5 cents (for cash transactions)
 */
export function roundToNearestFiveCents(amount: Money | number): Money {
  const money = amount instanceof Money ? amount : new Money(amount)
  const cents = money.toCents()
  const rounded = Math.round(cents / 5) * 5
  return Money.fromCents(rounded)
}

// Utility functions for quick operations
export const money = (value: number | string | Decimal) => new Money(value)
export const peso = money // Alias for Mexican context