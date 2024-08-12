import chalk from 'chalk';
import { readChar } from './input.utils';

export interface IMenuItem {
  key: string;
  label: string;
}

export class Menu {
  private items: IMenuItem[] = [];
  constructor(items: IMenuItem[]) {
    this.items = items;
  }
  serialize(): string {
    return chalk.greenBright(
      this.items.reduce((str, item) => {
        if (str) {
          str += '\n';
        }
        str += `${item.key}.\t${item.label}`;
        return str;
      }, '')
    );
  }

  getItem(key: string): IMenuItem | null {
    return this.items.find((i) => i.key === key) || null;
  }

  async show() {
    const op = await readChar(this.serialize());
    const menuItem = this.getItem(op);
    if (menuItem) {
      console.log(
        chalk.greenBright(`\nChoice: ${menuItem.key}.\t${menuItem.label}\n`)
      );
    }
    return op;
  }
}
