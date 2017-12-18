import { browser, by, element } from 'protractor';
import 'tslib';

describe('Home', () => {

  beforeEach(async () => {
    /**
     * Change hash depending on router LocationStrategy.
     */
    await browser.get('/#/home');
  });

  it('should have a title', async () => {
    const subject = await browser.getTitle();
    const result  = 'Angular2 Webpack Starter by @gdi2290 from @AngularClass';
    expect(subject).toEqual(result);
  });

  it('should have `your content here` app-x-large', async () => {
    const subject = await element(by.css('[app-x-large]')).getText();
    const result  = 'Your Content Here';
    expect(subject).toEqual(result);
  });

});
