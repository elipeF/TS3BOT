export const WITH_OPTIONS = 'WITH_OPTIONS';
export const WITHOUT_OPTIONS = 'WITHOUT_OPTIONS';

export default class CommandClass {
  private excluded = ['constructor'];

  public getOptions(className): String[] {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(className),
    );
    const difference = methods.filter((x) => !this.excluded.includes(x));
    const privateRemoved = difference.filter((x) => x.charAt(0) !== '_');
    return privateRemoved;
  }
}
