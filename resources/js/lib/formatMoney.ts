/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (USD, EUR, CDF, etc.)
 * @param locale - Locale to use for formatting
 * @returns Formatted currency string
 */
export function formatMoney(
    amount: number | string,
    currency: string = 'USD',
    locale: string = 'fr-CD'
  ): string {
    // Convert string input to number
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
    // Options for USD (common in RDC)
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
  
    // Special cases for Congolese Francs (CDF)
    if (currency === 'CDF') {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    }
  
    try {
      return new Intl.NumberFormat(locale, options).format(numericAmount);
    } catch (e) {
      // Fallback if Intl is not supported or currency is invalid
      return `${numericAmount.toFixed(2)} ${currency}`;
    }
  }
  
  // Alternative version with symbol mapping if needed
  export function formatMoneyWithSymbol(
    amount: number,
    currency: string = 'USD'
  ): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CDF: 'FC',
    };
  
    const symbol = symbols[currency] || currency;
    return `${symbol} ${amount.toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }