export class NotFoundException extends Error {}
export class TypeNotFoundException extends Error {
  fallback: string

  constructor(fallback: string) {
    super()
    this.fallback = fallback
  }
}

export class PageOverflowException extends Error {
  page: number
  constructor(page: number) {
    super()
    this.page = page
  }
}

export class PageNonPositiveException extends Error {
  constructor() {
    super()
  }
}
