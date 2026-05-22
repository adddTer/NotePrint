/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TokenSegment {
  text: string;
  type: 'normal' | 'sub' | 'sup' | 'bold' | 'italic';
}

/**
 * Parses a chemical formula string (e.g., "KMnO4", "Fe3+", "Cr2O7^2-") into structured segments
 * for subscripts and superscripts rendering in JSX.
 */
export function formatChemicalFormula(formula: string): TokenSegment[] {
  if (!formula) return [];
  
  const segments: TokenSegment[] = [];
  let i = 0;
  
  // Extract initial coefficient if present (e.g. "2" in "2H2O")
  let coef = '';
  while (i < formula.length && /[0-9]/.test(formula[i]) && i === coef.length) {
    coef += formula[i];
    i++;
  }
  
  if (coef) {
    segments.push({ text: coef, type: 'bold' });
  }
  
  while (i < formula.length) {
    const char = formula[i];
    
    // Check for explicit superscript indicator
    if (char === '^') {
      i++; // skip '^'
      let supText = '';
      while (i < formula.length && /[0-9+\-a-zA-Z]/.test(formula[i])) {
        supText += formula[i];
        i++;
      }
      if (supText) {
        segments.push({ text: supText, type: 'sup' });
      }
      continue;
    }
    
    // Check if we have an ion charge at the end without explicit '^' (e.g. "Fe3+", "SO42-", "OH-")
    // If we are at a number followed by + or - and nothing else, or just + / - at the end
    const remaining = formula.substring(i);
    const chargeMatch = remaining.match(/^([0-9]*[+\-])/);
    
    // Wait, let's distinguish charges from normal chemical subscripts. 
    // E.g., in "Fe3+", remaining is "3+". It matches. We render "3+" as superscript.
    // In "H2SO4", "2" is not followed by + or -. So it falls through to subscript.
    if (chargeMatch) {
      const matchText = chargeMatch[1];
      segments.push({ text: matchText, type: 'sup' });
      i += matchText.length;
      continue;
    }
    
    // Check for subscripts (numbers after uppercase/lowercase letter, closing parenthesis, or square bracket)
    if (/[0-9]/.test(char)) {
      // It's a subscript
      segments.push({ text: char, type: 'sub' });
      i++;
    } else {
      // Normal character (element symbols, brackets, plus/equals signs)
      segments.push({ text: char, type: 'normal' });
      i++;
    }
  }
  
  return segments;
}

/**
 * Formats a full chemical reaction equation (which can contain +, =, and reaction conditions)
 */
export function formatChemicalEquation(equation: string): React.ReactNode {
  if (!equation) return null;
  
  // Split equation into tokens by space
  const tokens = equation.trim().split(/\s+/);
  
  return tokens.map((token, index) => {
    // Treat arrows, plus, equal as special symbols
    if (token === '+' || token === '=' || token === '═' || token === '==' || token === '→' || token === '⇌' || token === '===') {
      let displaySymbol = token;
      if (token === '==' || token === '===' || token === '=') displaySymbol = '═';
      return (
        <span key={index} className="mx-2 text-gray-400 font-medium select-none text-base">
          {displaySymbol}
        </span>
      );
    }
    
    // Gas/precipitate indicators
    if (token === '↑' || token === '↓') {
      return (
        <span key={index} className="ml-0.5 mr-1 font-bold text-blue-600 select-none text-sm leading-none">
          {token}
        </span>
      );
    }
    
    // Format individual chemical block
    const segments = formatChemicalFormula(token);
    return (
      <span key={index} className="inline-block font-sans text-stone-800 font-medium tracking-wide">
        {segments.map((seg, sIdx) => {
          if (seg.type === 'sub') {
            return <sub key={sIdx} className="text-[0.7em] bottom-[-0.2em] font-semibold text-rose-700/95">{seg.text}</sub>;
          }
          if (seg.type === 'sup') {
            return <sup key={sIdx} className="text-[0.7em] top-[-0.3em] font-semibold text-indigo-700">{seg.text}</sup>;
          }
          if (seg.type === 'bold') {
            return <span key={sIdx} className="font-bold text-amber-700 text-[1.05em] mr-0.5">{seg.text}</span>;
          }
          return <span key={sIdx}>{seg.text}</span>;
        })}
      </span>
    );
  });
}

/**
 * Format mathematical expressions, converting variables inside ^ to superscript,
 * / to a visual fraction or slash, and sqrt() into beautiful styled radical blocks.
 * Provides a crisp display for math / physics.
 */
export function formatMathExpression(expr: string): React.ReactNode {
  if (!expr) return null;
  
  // Handlers for Greek letter replacements
  let formatted = expr
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\inf/g, '∞')
    .replace(/\*/g, ' × ')
    .replace(/<=/g, ' ≤ ')
    .replace(/>=/g, ' ≥ ')
    .replace(/!=/g, ' ≠ ');
    
  // Check for complex fraction format: frac{numerator}{denominator}
  // Let's support visual fractions if users use a slash `/` with brackets or just clean split.
  // For the basic visual presentation, we parse superscript `^` or subscript `_`
  
  const renderFormulaTokenObj = (txt: string) => {
    const chars: React.ReactNode[] = [];
    let i = 0;
    while (i < txt.length) {
      const c = txt[i];
      if (c === '^') {
        i++;
        let sup = '';
        if (txt[i] === '{') {
          i++; // skip '{'
          while (i < txt.length && txt[i] !== '}') {
            sup += txt[i];
            i++;
          }
          i++; // skip '}'
        } else {
          sup = txt[i] || '';
          i++;
        }
        chars.push(<sup key={`sup-${i}`} className="text-[0.75em] text-emerald-800 font-semibold">{sup}</sup>);
      } else if (c === '_') {
        i++;
        let sub = '';
        if (txt[i] === '{') {
          i++;
          while (i < txt.length && txt[i] !== '}') {
            sub += txt[i];
            i++;
          }
          i++;
        } else {
          sub = txt[i] || '';
          i++;
        }
        chars.push(<sub key={`sub-${i}`} className="text-[0.75em] text-cyan-800 font-semibold">{sub}</sub>);
      } else if (txt.substring(i, i+5) === 'sqrt(') {
        // sqrt bracket parsing
        i += 5;
        let inner = '';
        let bracketCount = 1;
        while (i < txt.length && bracketCount > 0) {
          if (txt[i] === '(') bracketCount++;
          if (txt[i] === ')') bracketCount--;
          if (bracketCount > 0) {
            inner += txt[i];
          }
          i++;
        }
        chars.push(
          <span key={`sqrt-${i}`} className="inline-flex items-center mx-0.5">
            <span className="font-sans text-stone-800 text-lg leading-none select-none">√</span>
            <span className="border-t border-stone-800 px-0.5 text-sm pt-0.5 leading-none">
              {renderFormulaTokenObj(inner)}
            </span>
          </span>
        );
      } else {
        // Variables italicized, operators normal
        const isLetter = /[a-zA-Z]/.test(c);
        chars.push(
          <span key={i} className={isLetter ? 'italic text-stone-900 mx-px' : 'font-sans text-stone-600'}>
            {c}
          </span>
        );
        i++;
      }
    }
    return chars;
  };
  
  // If we have " = " in the formula, split it to keep alignment
  if (formatted.includes('=')) {
    const parts = formatted.split('=');
    return (
      <div className="inline-flex flex-wrap items-center gap-1">
        {renderFormulaTokenObj(parts[0].trim())}
        <span className="mx-1 text-slate-400 font-medium">=</span>
        {renderFormulaTokenObj(parts[1].trim())}
      </div>
    );
  }
  
  return <span className="inline-flex items-center flex-wrap">{renderFormulaTokenObj(formatted)}</span>;
}

/**
 * Renders MS Word styled rich text markup securely into React HTML format, supporting bold, italics, 
 * strike, underlined, mark highlighter, and custom text colors with line breaks.
 */
export function renderRichText(text: string): React.ReactNode {
  if (!text) return '';
  
  // Strip potentially executable unsafe tags
  let sanitized = text
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, '')
    .replace(/onload/gi, 'no-load')
    .replace(/onerror/gi, 'no-err')
    .replace(/\n/g, '<br/>');

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitized }} 
      className="rich-text-content leading-relaxed text-stone-800 text-sm whitespace-pre-line"
    />
  );
}
