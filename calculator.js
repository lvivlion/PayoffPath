/**
 * calculator.js
 * Loan mathematics for amortization and savings.
 * Works with any amortized loan: mortgage, student, auto, personal.
 */

const LoanCalculator = {
    /**
     * Calculate monthly payment (Principal + Interest only)
     */
    calculateMonthlyPayment(principal, annualRate, years) {
        const monthlyRate = annualRate / 100 / 12;
        const numberOfPayments = years * 12;
        return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    },

    /**
     * Generate amortization schedule and find total interest
     */
    getAmortizationStats(principal, annualRate, monthlyPayment, monthlyExtra = 0, oneTimeExtra = 0) {
        const monthlyRate = annualRate / 100 / 12;
        let balance = principal - oneTimeExtra;
        let totalInterest = 0;
        let totalPrincipal = oneTimeExtra;
        let months = 0;
        const schedule = [];

        while (balance > 0 && months < 600) {
            const interest = balance * monthlyRate;
            let principalPaid = (monthlyPayment + monthlyExtra) - interest;

            if (principalPaid > balance) {
                principalPaid = balance;
            }

            totalInterest += interest;
            totalPrincipal += principalPaid;
            balance -= principalPaid;
            months++;

            schedule.push({
                month: months,
                balance: Math.max(0, balance),
                interestPaid: totalInterest,
                principalPaid: totalPrincipal
            });
        }

        return {
            months,
            totalInterest,
            totalPrincipal,
            totalPaid: totalInterest + totalPrincipal,
            years: (months / 12).toFixed(1),
            schedule
        };
    },

    /**
     * Parse a maturity date string
     */
    parseMaturityDate(dateStr) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[0] - 1, parts[1]);
        }
        return new Date();
    },

    /**
     * Generate a full amortization schedule from a start date
     */
    getFullScheduleStartingFrom(originalPrincipal, annualRate, monthlyPayment, startDateStr) {
        const monthlyRate = annualRate / 100 / 12;
        const schedule = [];
        let balance = originalPrincipal;
        let month = 0;

        while (balance > 0 && month < 480) {
            const interest = balance * monthlyRate;
            const principalPaid = monthlyPayment - interest;

            schedule.push({
                month: month,
                balance: balance,
                interestPaid: interest,
                principalPaid: principalPaid
            });

            balance -= principalPaid;
            month++;
        }
        return schedule;
    },

    /**
     * Calculate how much interest was saved by reaching current balance early
     */
    calculateHistoricalSavings(originalPrincipal, currentBalance, annualRate, monthlyPayment, startDateStr) {
        const monthlyRate = annualRate / 100 / 12;
        const startDate = new Date(startDateStr);
        const now = new Date();
        const monthsPassed = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());

        let standardBalance = originalPrincipal;
        for (let i = 0; i < monthsPassed; i++) {
            const interest = standardBalance * monthlyRate;
            standardBalance -= (monthlyPayment - interest);
            if (standardBalance <= 0) break;
        }

        let simulatedBalance = originalPrincipal;
        let stdMonthsToReachCurrent = 0;
        let historicalInterestPaid = 0;
        while (simulatedBalance > currentBalance && stdMonthsToReachCurrent < 600) {
            const interest = simulatedBalance * monthlyRate;
            historicalInterestPaid += interest;
            simulatedBalance -= (monthlyPayment - interest);
            stdMonthsToReachCurrent++;
        }

        const principalAhead = standardBalance - currentBalance;
        const historicalMonthsSaved = stdMonthsToReachCurrent - monthsPassed;

        return {
            principalAhead: Math.max(0, principalAhead),
            monthsPassed: monthsPassed,
            stdMonthsToReachCurrent: stdMonthsToReachCurrent,
            historicalMonthsSaved: Math.max(0, historicalMonthsSaved),
            historicalInterestPaid: historicalInterestPaid
        };
    }
};

if (typeof module !== 'undefined') {
    module.exports = LoanCalculator;
}
