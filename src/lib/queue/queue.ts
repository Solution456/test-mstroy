export default class Queue<T> {
  private items: T[] = []

  constructor(items: T[]) {
    this.items = [...items]
  }

  enqueue(item: T | T[]) {
    if (Array.isArray(item)) this.items.push(...item)
    else this.items.push(item)
  }

  dequeue(): T | undefined {
    return this.items.shift()
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }
}
