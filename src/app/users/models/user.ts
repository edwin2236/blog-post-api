export class User {
  constructor(
    public id: number,
    public name: string,
  ) {}

  public toJson() {
    return { id: this.id, name: this.name }
  }

  public static fromJson(json: unknown) {
    if (typeof json !== 'object' || json === null) {
      throw new Error('Invalid JSON format')
    }

    const jsonObj = json as { id: number; name: string }

    if (typeof jsonObj.id !== 'number' || typeof jsonObj.name !== 'string') {
      throw new Error('Invalid user data format')
    }

    return new User(jsonObj.id, jsonObj.name)
  }
}
