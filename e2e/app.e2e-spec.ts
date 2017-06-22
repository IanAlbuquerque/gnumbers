import { GnumbersPage } from './app.po';

describe('gnumbers App', () => {
  let page: GnumbersPage;

  beforeEach(() => {
    page = new GnumbersPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
