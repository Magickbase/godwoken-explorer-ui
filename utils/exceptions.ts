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

export class PageSizeException extends Error {
  constructor() {
    super()
  }
}

export class TabNotFoundException extends Error {
  constructor() {
    super()
  }
}

export class GwHashException extends Error {
  constructor(ethHash: string) {
    super(
      `You're visiting a polyjuice transaction with a gw_hash which is just for developers, please use an eth_hash(${ethHash}) instead`,
    )
  }
}
