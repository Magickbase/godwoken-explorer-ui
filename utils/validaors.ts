import { PageNonPositiveException, PageSizeException } from './exceptions'

export const validatePageQuery = (page: string, pageSize?: { size: string; sizes: Array<string> }) => {
  if (+page < 1) {
    throw new PageNonPositiveException()
  }

  if (pageSize && !pageSize.sizes.includes(pageSize.size as string)) {
    throw new PageSizeException()
  }
}
