export const wrapChemistryVariables = (text: string): string => {
  if (!text) return text;
  
  let i = 0;
  let result = '';
  
  while (i < text.length) {
    const ceIndex = text.indexOf('\\ce{', i);
    if (ceIndex === -1) {
      result += text.slice(i);
      break;
    }
    
    // Check if preceded by $
    const prevChar = ceIndex > 0 ? text[ceIndex - 1] : '';
    const isWrappedStart = prevChar === '$';
    
    result += text.slice(i, ceIndex);
    
    // Find matching brace
    let braceCount = 0;
    let endIndex = -1;
    for (let j = ceIndex + 3; j < text.length; j++) {
      if (text[j] === '{') braceCount++;
      if (text[j] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = j;
          break;
        }
      }
    }
    
    if (endIndex !== -1) {
      const nextChar = endIndex + 1 < text.length ? text[endIndex + 1] : '';
      const isWrappedEnd = nextChar === '$';
      
      let ceContent = text.slice(ceIndex, endIndex + 1);
      
      // Fix mhchem polymer syntax: convert [-X-]_n to {-}[ X ]{-}_{n}
      ceContent = ceContent.replace(/\[-(.*?)-\]_([A-Za-z0-9]+)/g, '{-}[ $1 ]{-}_{$2}');

      if (!isWrappedStart && !isWrappedEnd) {
         result += `$${ceContent}$`;
      } else {
         result += ceContent;
      }
      i = endIndex + 1;
    } else {
      // Unmatched brace, just skip
      result += '\\ce';
      i = ceIndex + 3;
    }
  }
  
  return result;
};
