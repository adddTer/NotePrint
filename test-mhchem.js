import katex from 'katex';
import 'katex/dist/contrib/mhchem.mjs';
try {
  console.log(katex.renderToString("\\ce{ A =[\\Delta] B }"));
} catch (e) {
  console.error(e.message);
}
