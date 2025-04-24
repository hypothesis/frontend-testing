import { DefaultReporter } from 'vitest/reporters';

/**
 * This reporter provides a real-time progress summary during test execution and
 * reports failures in detail but avoids printing a list of successful tests.
 * For context see https://github.com/vitest-dev/vitest/issues/7881
 */
export class SummaryReporter extends DefaultReporter {
  onTestModuleEnd() {
    // Override this method to suppress individual file results
  }
}
