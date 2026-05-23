import katex from 'katex';
import 'katex/dist/contrib/mhchem.mjs';

function test(formula) {
  try {
    console.log(formula);
    const html = katex.renderToString(formula);
    console.log(html);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}

test("\\ce{ {-}[ CH2-CH2 ]{-}_{n} }");
test("\\ce{ -[ CH2-CH2 ]-_{n} }");
test("\\ce{ [-CH2-CH2-]_n }");
