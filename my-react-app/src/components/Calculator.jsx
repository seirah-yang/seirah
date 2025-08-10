import React, { useState } from "react";

/* 간단 안전 파서: 숫자/소수, + - * /, () 지원 */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let num = ch; i++;
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      if (num.split(".").length > 2) throw new Error("잘못된 소수점");
      tokens.push({ type: "num", value: parseFloat(num) });
      continue;
    }
    if ("+-*/()".includes(ch)) { tokens.push({ type: ch, value: ch }); i++; continue; }
    throw new Error("허용되지 않는 문자: " + ch);
  }
  return tokens;
}
function toRPN(tokens) {
  const out = [], op = [];
  const prec = { "+":1, "-":1, "*":2, "/":2 };
  const isOp = t => ["+","-","*","/"].includes(t.type);
  tokens.forEach(t => {
    if (t.type === "num") out.push(t);
    else if (isOp(t)) {
      while (op.length && isOp(op[op.length-1]) && prec[op[op.length-1].type] >= prec[t.type]) out.push(op.pop());
      op.push(t);
    } else if (t.type === "(") op.push(t);
    else if (t.type === ")") {
      while (op.length && op[op.length-1].type !== "(") out.push(op.pop());
      if (!op.length) throw new Error("괄호 불일치");
      op.pop();
    }
  });
  while (op.length) {
    const t = op.pop();
    if (t.type === "(") throw new Error("괄호 불일치");
    out.push(t);
  }
  return out;
}
function evalRPN(rpn) {
  const st = [];
  rpn.forEach(t => {
    if (t.type === "num") st.push(t.value);
    else {
      const b = st.pop(); const a = st.pop();
      if (a === undefined || b === undefined) throw new Error("수식 오류");
      switch (t.type) {
        case "+": st.push(a + b); break;
        case "-": st.push(a - b); break;
        case "*": st.push(a * b); break;
        case "/": st.push(b === 0 ? NaN : a / b); break;
        default: throw new Error("연산자 오류");
      }
    }
  });
  if (st.length !== 1) throw new Error("수식 오류");
  return st[0];
}
function safeEval(expr) {
  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  const result = evalRPN(rpn);
  if (!isFinite(result)) throw new Error("계산 불가");
  return result;
}

export default function Calculator() {
  const [value, setValue] = useState("");
  const append = v => setValue(prev => prev + v);
  const clear = () => setValue("");
  const calc = () => { try { setValue(String(safeEval(value))); } catch { setValue("오류"); } };

  return (
    <div className="calculator-wrapper">
      <div className="calculator">
        <input type="text" readOnly value={value} />
        <div className="calc-buttons">
          {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"].map(btn =>
            btn === "="
              ? <button key={btn} onClick={calc}>=</button>
              : <button key={btn} onClick={() => append(btn)}>{btn === "*" ? "×" : btn === "/" ? "÷" : btn}</button>
          )}
          <button className="clear-btn" onClick={clear}>C</button>
        </div>
      </div>
    </div>
  );
}