import {
  PageContainer,
  executeQuery
} from "/build/_shared/chunk-47F22B26.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-NO3FWBWP.js";
import {
  require_react
} from "/build/_shared/chunk-ULL77KT2.js";
import {
  createHotContext
} from "/build/_shared/chunk-UG3ISROB.js";
import "/build/_shared/chunk-R3YRPWCC.js";
import {
  __commonJS,
  __export,
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// ../../node_modules/.pnpm/nearley@2.20.1/node_modules/nearley/lib/nearley.js
var require_nearley = __commonJS({
  "../../node_modules/.pnpm/nearley@2.20.1/node_modules/nearley/lib/nearley.js"(exports, module) {
    (function(root, factory) {
      if (typeof module === "object" && module.exports) {
        module.exports = factory();
      } else {
        root.nearley = factory();
      }
    })(exports, function() {
      function Rule(name, symbols, postprocess) {
        this.id = ++Rule.highestId;
        this.name = name;
        this.symbols = symbols;
        this.postprocess = postprocess;
        return this;
      }
      Rule.highestId = 0;
      Rule.prototype.toString = function(withCursorAt) {
        var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(getSymbolShortDisplay).join(" ") : this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(" ") + " \u25CF " + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(" ");
        return this.name + " \u2192 " + symbolSequence;
      };
      function State(rule, dot, reference, wantedBy) {
        this.rule = rule;
        this.dot = dot;
        this.reference = reference;
        this.data = [];
        this.wantedBy = wantedBy;
        this.isComplete = this.dot === rule.symbols.length;
      }
      State.prototype.toString = function() {
        return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
      };
      State.prototype.nextState = function(child) {
        var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
        state.left = this;
        state.right = child;
        if (state.isComplete) {
          state.data = state.build();
          state.right = void 0;
        }
        return state;
      };
      State.prototype.build = function() {
        var children = [];
        var node = this;
        do {
          children.push(node.right.data);
          node = node.left;
        } while (node.left);
        children.reverse();
        return children;
      };
      State.prototype.finish = function() {
        if (this.rule.postprocess) {
          this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
        }
      };
      function Column(grammar2, index) {
        this.grammar = grammar2;
        this.index = index;
        this.states = [];
        this.wants = {};
        this.scannable = [];
        this.completed = {};
      }
      Column.prototype.process = function(nextColumn) {
        var states = this.states;
        var wants = this.wants;
        var completed = this.completed;
        for (var w = 0; w < states.length; w++) {
          var state = states[w];
          if (state.isComplete) {
            state.finish();
            if (state.data !== Parser.fail) {
              var wantedBy = state.wantedBy;
              for (var i = wantedBy.length; i--; ) {
                var left = wantedBy[i];
                this.complete(left, state);
              }
              if (state.reference === this.index) {
                var exp = state.rule.name;
                (this.completed[exp] = this.completed[exp] || []).push(state);
              }
            }
          } else {
            var exp = state.rule.symbols[state.dot];
            if (typeof exp !== "string") {
              this.scannable.push(state);
              continue;
            }
            if (wants[exp]) {
              wants[exp].push(state);
              if (completed.hasOwnProperty(exp)) {
                var nulls = completed[exp];
                for (var i = 0; i < nulls.length; i++) {
                  var right = nulls[i];
                  this.complete(state, right);
                }
              }
            } else {
              wants[exp] = [state];
              this.predict(exp);
            }
          }
        }
      };
      Column.prototype.predict = function(exp) {
        var rules = this.grammar.byName[exp] || [];
        for (var i = 0; i < rules.length; i++) {
          var r = rules[i];
          var wantedBy = this.wants[exp];
          var s = new State(r, 0, this.index, wantedBy);
          this.states.push(s);
        }
      };
      Column.prototype.complete = function(left, right) {
        var copy = left.nextState(right);
        this.states.push(copy);
      };
      function Grammar2(rules, start) {
        this.rules = rules;
        this.start = start || this.rules[0].name;
        var byName = this.byName = {};
        this.rules.forEach(function(rule) {
          if (!byName.hasOwnProperty(rule.name)) {
            byName[rule.name] = [];
          }
          byName[rule.name].push(rule);
        });
      }
      Grammar2.fromCompiled = function(rules, start) {
        var lexer2 = rules.Lexer;
        if (rules.ParserStart) {
          start = rules.ParserStart;
          rules = rules.ParserRules;
        }
        var rules = rules.map(function(r) {
          return new Rule(r.name, r.symbols, r.postprocess);
        });
        var g = new Grammar2(rules, start);
        g.lexer = lexer2;
        return g;
      };
      function StreamLexer() {
        this.reset("");
      }
      StreamLexer.prototype.reset = function(data, state) {
        this.buffer = data;
        this.index = 0;
        this.line = state ? state.line : 1;
        this.lastLineBreak = state ? -state.col : 0;
      };
      StreamLexer.prototype.next = function() {
        if (this.index < this.buffer.length) {
          var ch = this.buffer[this.index++];
          if (ch === "\n") {
            this.line += 1;
            this.lastLineBreak = this.index;
          }
          return { value: ch };
        }
      };
      StreamLexer.prototype.save = function() {
        return {
          line: this.line,
          col: this.index - this.lastLineBreak
        };
      };
      StreamLexer.prototype.formatError = function(token, message) {
        var buffer = this.buffer;
        if (typeof buffer === "string") {
          var lines = buffer.split("\n").slice(
            Math.max(0, this.line - 5),
            this.line
          );
          var nextLineBreak = buffer.indexOf("\n", this.index);
          if (nextLineBreak === -1)
            nextLineBreak = buffer.length;
          var col = this.index - this.lastLineBreak;
          var lastLineDigits = String(this.line).length;
          message += " at line " + this.line + " col " + col + ":\n\n";
          message += lines.map(function(line, i) {
            return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
          }, this).join("\n");
          message += "\n" + pad("", lastLineDigits + col) + "^\n";
          return message;
        } else {
          return message + " at index " + (this.index - 1);
        }
        function pad(n, length) {
          var s = String(n);
          return Array(length - s.length + 1).join(" ") + s;
        }
      };
      function Parser(rules, start, options) {
        if (rules instanceof Grammar2) {
          var grammar2 = rules;
          var options = start;
        } else {
          var grammar2 = Grammar2.fromCompiled(rules, start);
        }
        this.grammar = grammar2;
        this.options = {
          keepHistory: false,
          lexer: grammar2.lexer || new StreamLexer()
        };
        for (var key in options || {}) {
          this.options[key] = options[key];
        }
        this.lexer = this.options.lexer;
        this.lexerState = void 0;
        var column = new Column(grammar2, 0);
        var table = this.table = [column];
        column.wants[grammar2.start] = [];
        column.predict(grammar2.start);
        column.process();
        this.current = 0;
      }
      Parser.fail = {};
      Parser.prototype.feed = function(chunk) {
        var lexer2 = this.lexer;
        lexer2.reset(chunk, this.lexerState);
        var token;
        while (true) {
          try {
            token = lexer2.next();
            if (!token) {
              break;
            }
          } catch (e) {
            var nextColumn = new Column(this.grammar, this.current + 1);
            this.table.push(nextColumn);
            var err = new Error(this.reportLexerError(e));
            err.offset = this.current;
            err.token = e.token;
            throw err;
          }
          var column = this.table[this.current];
          if (!this.options.keepHistory) {
            delete this.table[this.current - 1];
          }
          var n = this.current + 1;
          var nextColumn = new Column(this.grammar, n);
          this.table.push(nextColumn);
          var literal = token.text !== void 0 ? token.text : token.value;
          var value = lexer2.constructor === StreamLexer ? token.value : token;
          var scannable = column.scannable;
          for (var w = scannable.length; w--; ) {
            var state = scannable[w];
            var expect = state.rule.symbols[state.dot];
            if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
              var next = state.nextState({ data: value, token, isToken: true, reference: n - 1 });
              nextColumn.states.push(next);
            }
          }
          nextColumn.process();
          if (nextColumn.states.length === 0) {
            var err = new Error(this.reportError(token));
            err.offset = this.current;
            err.token = token;
            throw err;
          }
          if (this.options.keepHistory) {
            column.lexerState = lexer2.save();
          }
          this.current++;
        }
        if (column) {
          this.lexerState = lexer2.save();
        }
        this.results = this.finish();
        return this;
      };
      Parser.prototype.reportLexerError = function(lexerError) {
        var tokenDisplay, lexerMessage;
        var token = lexerError.token;
        if (token) {
          tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
          lexerMessage = this.lexer.formatError(token, "Syntax error");
        } else {
          tokenDisplay = "input (lexer error)";
          lexerMessage = lexerError.message;
        }
        return this.reportErrorCommon(lexerMessage, tokenDisplay);
      };
      Parser.prototype.reportError = function(token) {
        var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== void 0 ? token.value : token);
        var lexerMessage = this.lexer.formatError(token, "Syntax error");
        return this.reportErrorCommon(lexerMessage, tokenDisplay);
      };
      Parser.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
        var lines = [];
        lines.push(lexerMessage);
        var lastColumnIndex = this.table.length - 2;
        var lastColumn = this.table[lastColumnIndex];
        var expectantStates = lastColumn.states.filter(function(state) {
          var nextSymbol = state.rule.symbols[state.dot];
          return nextSymbol && typeof nextSymbol !== "string";
        });
        if (expectantStates.length === 0) {
          lines.push("Unexpected " + tokenDisplay + ". I did not expect any more input. Here is the state of my parse table:\n");
          this.displayStateStack(lastColumn.states, lines);
        } else {
          lines.push("Unexpected " + tokenDisplay + ". Instead, I was expecting to see one of the following:\n");
          var stateStacks = expectantStates.map(function(state) {
            return this.buildFirstStateStack(state, []) || [state];
          }, this);
          stateStacks.forEach(function(stateStack) {
            var state = stateStack[0];
            var nextSymbol = state.rule.symbols[state.dot];
            var symbolDisplay = this.getSymbolDisplay(nextSymbol);
            lines.push("A " + symbolDisplay + " based on:");
            this.displayStateStack(stateStack, lines);
          }, this);
        }
        lines.push("");
        return lines.join("\n");
      };
      Parser.prototype.displayStateStack = function(stateStack, lines) {
        var lastDisplay;
        var sameDisplayCount = 0;
        for (var j = 0; j < stateStack.length; j++) {
          var state = stateStack[j];
          var display = state.rule.toString(state.dot);
          if (display === lastDisplay) {
            sameDisplayCount++;
          } else {
            if (sameDisplayCount > 0) {
              lines.push("    ^ " + sameDisplayCount + " more lines identical to this");
            }
            sameDisplayCount = 0;
            lines.push("    " + display);
          }
          lastDisplay = display;
        }
      };
      Parser.prototype.getSymbolDisplay = function(symbol) {
        return getSymbolLongDisplay(symbol);
      };
      Parser.prototype.buildFirstStateStack = function(state, visited) {
        if (visited.indexOf(state) !== -1) {
          return null;
        }
        if (state.wantedBy.length === 0) {
          return [state];
        }
        var prevState = state.wantedBy[0];
        var childVisited = [state].concat(visited);
        var childResult = this.buildFirstStateStack(prevState, childVisited);
        if (childResult === null) {
          return null;
        }
        return [state].concat(childResult);
      };
      Parser.prototype.save = function() {
        var column = this.table[this.current];
        column.lexerState = this.lexerState;
        return column;
      };
      Parser.prototype.restore = function(column) {
        var index = column.index;
        this.current = index;
        this.table[index] = column;
        this.table.splice(index + 1);
        this.lexerState = column.lexerState;
        this.results = this.finish();
      };
      Parser.prototype.rewind = function(index) {
        if (!this.options.keepHistory) {
          throw new Error("set option `keepHistory` to enable rewinding");
        }
        this.restore(this.table[index]);
      };
      Parser.prototype.finish = function() {
        var considerations = [];
        var start = this.grammar.start;
        var column = this.table[this.table.length - 1];
        column.states.forEach(function(t) {
          if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser.fail) {
            considerations.push(t);
          }
        });
        return considerations.map(function(c) {
          return c.data;
        });
      };
      function getSymbolLongDisplay(symbol) {
        var type = typeof symbol;
        if (type === "string") {
          return symbol;
        } else if (type === "object") {
          if (symbol.literal) {
            return JSON.stringify(symbol.literal);
          } else if (symbol instanceof RegExp) {
            return "character matching " + symbol;
          } else if (symbol.type) {
            return symbol.type + " token";
          } else if (symbol.test) {
            return "token matching " + String(symbol.test);
          } else {
            throw new Error("Unknown symbol type: " + symbol);
          }
        }
      }
      function getSymbolShortDisplay(symbol) {
        var type = typeof symbol;
        if (type === "string") {
          return symbol;
        } else if (type === "object") {
          if (symbol.literal) {
            return JSON.stringify(symbol.literal);
          } else if (symbol instanceof RegExp) {
            return symbol.toString();
          } else if (symbol.type) {
            return "%" + symbol.type;
          } else if (symbol.test) {
            return "<" + String(symbol.test) + ">";
          } else {
            throw new Error("Unknown symbol type: " + symbol);
          }
        }
      }
      return {
        Parser,
        Grammar: Grammar2,
        Rule
      };
    });
  }
});

// app/routes/query.tsx
var import_react = __toESM(require_react(), 1);

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/allDialects.js
var allDialects_exports = {};
__export(allDialects_exports, {
  bigquery: () => bigquery,
  db2: () => db2,
  hive: () => hive,
  mariadb: () => mariadb,
  mysql: () => mysql,
  n1ql: () => n1ql,
  plsql: () => plsql,
  postgresql: () => postgresql,
  redshift: () => redshift,
  singlestoredb: () => singlestoredb,
  snowflake: () => snowflake,
  spark: () => spark,
  sql: () => sql,
  sqlite: () => sqlite,
  transactsql: () => transactsql,
  trino: () => trino
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/lexer/token.js
var TokenType;
(function(TokenType2) {
  TokenType2["QUOTED_IDENTIFIER"] = "QUOTED_IDENTIFIER";
  TokenType2["IDENTIFIER"] = "IDENTIFIER";
  TokenType2["STRING"] = "STRING";
  TokenType2["VARIABLE"] = "VARIABLE";
  TokenType2["RESERVED_KEYWORD"] = "RESERVED_KEYWORD";
  TokenType2["RESERVED_FUNCTION_NAME"] = "RESERVED_FUNCTION_NAME";
  TokenType2["RESERVED_PHRASE"] = "RESERVED_PHRASE";
  TokenType2["RESERVED_SET_OPERATION"] = "RESERVED_SET_OPERATION";
  TokenType2["RESERVED_CLAUSE"] = "RESERVED_CLAUSE";
  TokenType2["RESERVED_SELECT"] = "RESERVED_SELECT";
  TokenType2["RESERVED_JOIN"] = "RESERVED_JOIN";
  TokenType2["ARRAY_IDENTIFIER"] = "ARRAY_IDENTIFIER";
  TokenType2["ARRAY_KEYWORD"] = "ARRAY_KEYWORD";
  TokenType2["CASE"] = "CASE";
  TokenType2["END"] = "END";
  TokenType2["WHEN"] = "WHEN";
  TokenType2["ELSE"] = "ELSE";
  TokenType2["THEN"] = "THEN";
  TokenType2["LIMIT"] = "LIMIT";
  TokenType2["BETWEEN"] = "BETWEEN";
  TokenType2["AND"] = "AND";
  TokenType2["OR"] = "OR";
  TokenType2["XOR"] = "XOR";
  TokenType2["OPERATOR"] = "OPERATOR";
  TokenType2["COMMA"] = "COMMA";
  TokenType2["ASTERISK"] = "ASTERISK";
  TokenType2["DOT"] = "DOT";
  TokenType2["OPEN_PAREN"] = "OPEN_PAREN";
  TokenType2["CLOSE_PAREN"] = "CLOSE_PAREN";
  TokenType2["LINE_COMMENT"] = "LINE_COMMENT";
  TokenType2["BLOCK_COMMENT"] = "BLOCK_COMMENT";
  TokenType2["NUMBER"] = "NUMBER";
  TokenType2["NAMED_PARAMETER"] = "NAMED_PARAMETER";
  TokenType2["QUOTED_PARAMETER"] = "QUOTED_PARAMETER";
  TokenType2["NUMBERED_PARAMETER"] = "NUMBERED_PARAMETER";
  TokenType2["POSITIONAL_PARAMETER"] = "POSITIONAL_PARAMETER";
  TokenType2["CUSTOM_PARAMETER"] = "CUSTOM_PARAMETER";
  TokenType2["DELIMITER"] = "DELIMITER";
  TokenType2["EOF"] = "EOF";
})(TokenType || (TokenType = {}));
var createEofToken = (index) => ({
  type: TokenType.EOF,
  raw: "\xABEOF\xBB",
  text: "\xABEOF\xBB",
  start: index
});
var EOF_TOKEN = createEofToken(Infinity);
var testToken = (compareToken) => (token) => token.type === compareToken.type && token.text === compareToken.text;
var isToken = {
  ARRAY: testToken({
    text: "ARRAY",
    type: TokenType.RESERVED_KEYWORD
  }),
  BY: testToken({
    text: "BY",
    type: TokenType.RESERVED_KEYWORD
  }),
  SET: testToken({
    text: "SET",
    type: TokenType.RESERVED_CLAUSE
  }),
  STRUCT: testToken({
    text: "STRUCT",
    type: TokenType.RESERVED_KEYWORD
  }),
  WINDOW: testToken({
    text: "WINDOW",
    type: TokenType.RESERVED_CLAUSE
  })
};
var isReserved = (type) => type === TokenType.RESERVED_KEYWORD || type === TokenType.RESERVED_FUNCTION_NAME || type === TokenType.RESERVED_PHRASE || type === TokenType.RESERVED_CLAUSE || type === TokenType.RESERVED_SELECT || type === TokenType.RESERVED_SET_OPERATION || type === TokenType.RESERVED_JOIN || type === TokenType.ARRAY_KEYWORD || type === TokenType.CASE || type === TokenType.END || type === TokenType.WHEN || type === TokenType.ELSE || type === TokenType.THEN || type === TokenType.LIMIT || type === TokenType.BETWEEN || type === TokenType.AND || type === TokenType.OR || type === TokenType.XOR;
var isLogicalOperator = (type) => type === TokenType.AND || type === TokenType.OR || type === TokenType.XOR;

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/expandPhrases.js
var expandPhrases = (phrases) => phrases.flatMap(expandSinglePhrase);
var expandSinglePhrase = (phrase) => buildCombinations(parsePhrase(phrase)).map((text) => text.trim());
var REQUIRED_PART = /[^[\]{}]+/y;
var REQUIRED_BLOCK = /\{.*?\}/y;
var OPTIONAL_BLOCK = /\[.*?\]/y;
var parsePhrase = (text) => {
  let index = 0;
  const result = [];
  while (index < text.length) {
    REQUIRED_PART.lastIndex = index;
    const requiredMatch = REQUIRED_PART.exec(text);
    if (requiredMatch) {
      result.push([requiredMatch[0].trim()]);
      index += requiredMatch[0].length;
    }
    OPTIONAL_BLOCK.lastIndex = index;
    const optionalBlockMatch = OPTIONAL_BLOCK.exec(text);
    if (optionalBlockMatch) {
      const choices = optionalBlockMatch[0].slice(1, -1).split("|").map((s) => s.trim());
      result.push(["", ...choices]);
      index += optionalBlockMatch[0].length;
    }
    REQUIRED_BLOCK.lastIndex = index;
    const requiredBlockMatch = REQUIRED_BLOCK.exec(text);
    if (requiredBlockMatch) {
      const choices = requiredBlockMatch[0].slice(1, -1).split("|").map((s) => s.trim());
      result.push(choices);
      index += requiredBlockMatch[0].length;
    }
    if (!requiredMatch && !optionalBlockMatch && !requiredBlockMatch) {
      throw new Error(`Unbalanced parenthesis in: ${text}`);
    }
  }
  return result;
};
var buildCombinations = ([first, ...rest]) => {
  if (first === void 0) {
    return [""];
  }
  return buildCombinations(rest).flatMap((tail) => first.map((head) => head.trim() + " " + tail.trim()));
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/utils.js
var dedupe = (arr) => [...new Set(arr)];
var last = (arr) => arr[arr.length - 1];
var sortByLengthDesc = (strings) => strings.sort((a, b) => b.length - a.length || a.localeCompare(b));
var maxLength = (strings) => strings.reduce((max, cur) => Math.max(max, cur.length), 0);
var equalizeWhitespace = (s) => s.replace(/\s+/gu, " ");
var flatKeywordList = (obj) => dedupe(Object.values(obj).flat());
var isMultiline = (text) => /\n/.test(text);

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/bigquery/bigquery.keywords.js
var keywords = flatKeywordList({
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/lexical#reserved_keywords
  keywords: ["ALL", "AND", "ANY", "ARRAY", "AS", "ASC", "ASSERT_ROWS_MODIFIED", "AT", "BETWEEN", "BY", "CASE", "CAST", "COLLATE", "CONTAINS", "CREATE", "CROSS", "CUBE", "CURRENT", "DEFAULT", "DEFINE", "DESC", "DISTINCT", "ELSE", "END", "ENUM", "ESCAPE", "EXCEPT", "EXCLUDE", "EXISTS", "EXTRACT", "FALSE", "FETCH", "FOLLOWING", "FOR", "FROM", "FULL", "GROUP", "GROUPING", "GROUPS", "HASH", "HAVING", "IF", "IGNORE", "IN", "INNER", "INTERSECT", "INTERVAL", "INTO", "IS", "JOIN", "LATERAL", "LEFT", "LIKE", "LIMIT", "LOOKUP", "MERGE", "NATURAL", "NEW", "NO", "NOT", "NULL", "NULLS", "OF", "ON", "OR", "ORDER", "OUTER", "OVER", "PARTITION", "PRECEDING", "PROTO", "RANGE", "RECURSIVE", "RESPECT", "RIGHT", "ROLLUP", "ROWS", "SELECT", "SET", "SOME", "STRUCT", "TABLE", "TABLESAMPLE", "THEN", "TO", "TREAT", "TRUE", "UNBOUNDED", "UNION", "UNNEST", "USING", "WHEN", "WHERE", "WINDOW", "WITH", "WITHIN"],
  datatypes: [
    "ARRAY",
    // parametric, ARRAY<T>
    "BOOL",
    "BYTES",
    // parameterised, BYTES(Length)
    "DATE",
    "DATETIME",
    "GEOGRAPHY",
    "INTERVAL",
    "INT64",
    "INT",
    "SMALLINT",
    "INTEGER",
    "BIGINT",
    "TINYINT",
    "BYTEINT",
    "NUMERIC",
    // parameterised, NUMERIC(Precision[, Scale])
    "DECIMAL",
    // parameterised, DECIMAL(Precision[, Scale])
    "BIGNUMERIC",
    // parameterised, BIGNUMERIC(Precision[, Scale])
    "BIGDECIMAL",
    // parameterised, BIGDECIMAL(Precision[, Scale])
    "FLOAT64",
    "STRING",
    // parameterised, STRING(Length)
    "STRUCT",
    // parametric, STRUCT<T>
    "TIME",
    "TIMEZONE"
  ],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/conversion_functions#formatting_syntax
  stringFormat: ["HEX", "BASEX", "BASE64M", "ASCII", "UTF-8", "UTF8"],
  misc: ["SAFE"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/data-definition-language
  ddl: [
    "LIKE",
    // CREATE TABLE LIKE
    "COPY",
    // CREATE TABLE COPY
    "CLONE",
    // CREATE TABLE CLONE
    "IN",
    "OUT",
    "INOUT",
    "RETURNS",
    "LANGUAGE",
    "CASCADE",
    "RESTRICT",
    "DETERMINISTIC"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/bigquery/bigquery.functions.js
var functions = flatKeywordList({
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/aead_encryption_functions
  aead: ["KEYS.NEW_KEYSET", "KEYS.ADD_KEY_FROM_RAW_BYTES", "AEAD.DECRYPT_BYTES", "AEAD.DECRYPT_STRING", "AEAD.ENCRYPT", "KEYS.KEYSET_CHAIN", "KEYS.KEYSET_FROM_JSON", "KEYS.KEYSET_TO_JSON", "KEYS.ROTATE_KEYSET", "KEYS.KEYSET_LENGTH"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_analytic_functions
  aggregateAnalytic: ["ANY_VALUE", "ARRAY_AGG", "AVG", "CORR", "COUNT", "COUNTIF", "COVAR_POP", "COVAR_SAMP", "MAX", "MIN", "ST_CLUSTERDBSCAN", "STDDEV_POP", "STDDEV_SAMP", "STRING_AGG", "SUM", "VAR_POP", "VAR_SAMP"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions
  aggregate: ["ANY_VALUE", "ARRAY_AGG", "ARRAY_CONCAT_AGG", "AVG", "BIT_AND", "BIT_OR", "BIT_XOR", "COUNT", "COUNTIF", "LOGICAL_AND", "LOGICAL_OR", "MAX", "MIN", "STRING_AGG", "SUM"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions
  approximateAggregate: ["APPROX_COUNT_DISTINCT", "APPROX_QUANTILES", "APPROX_TOP_COUNT", "APPROX_TOP_SUM"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions
  array: [
    // 'ARRAY',
    "ARRAY_CONCAT",
    "ARRAY_LENGTH",
    "ARRAY_TO_STRING",
    "GENERATE_ARRAY",
    "GENERATE_DATE_ARRAY",
    "GENERATE_TIMESTAMP_ARRAY",
    "ARRAY_REVERSE",
    "OFFSET",
    "SAFE_OFFSET",
    "ORDINAL",
    "SAFE_ORDINAL"
  ],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/bit_functions
  bitwise: ["BIT_COUNT"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/conversion_functions
  conversion: [
    // 'CASE',
    "PARSE_BIGNUMERIC",
    "PARSE_NUMERIC",
    "SAFE_CAST"
  ],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/date_functions
  date: ["CURRENT_DATE", "EXTRACT", "DATE", "DATE_ADD", "DATE_SUB", "DATE_DIFF", "DATE_TRUNC", "DATE_FROM_UNIX_DATE", "FORMAT_DATE", "LAST_DAY", "PARSE_DATE", "UNIX_DATE"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/datetime_functions
  datetime: ["CURRENT_DATETIME", "DATETIME", "EXTRACT", "DATETIME_ADD", "DATETIME_SUB", "DATETIME_DIFF", "DATETIME_TRUNC", "FORMAT_DATETIME", "LAST_DAY", "PARSE_DATETIME"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/debugging_functions
  debugging: ["ERROR"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/federated_query_functions
  federatedQuery: ["EXTERNAL_QUERY"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/geography_functions
  geography: ["S2_CELLIDFROMPOINT", "S2_COVERINGCELLIDS", "ST_ANGLE", "ST_AREA", "ST_ASBINARY", "ST_ASGEOJSON", "ST_ASTEXT", "ST_AZIMUTH", "ST_BOUNDARY", "ST_BOUNDINGBOX", "ST_BUFFER", "ST_BUFFERWITHTOLERANCE", "ST_CENTROID", "ST_CENTROID_AGG", "ST_CLOSESTPOINT", "ST_CLUSTERDBSCAN", "ST_CONTAINS", "ST_CONVEXHULL", "ST_COVEREDBY", "ST_COVERS", "ST_DIFFERENCE", "ST_DIMENSION", "ST_DISJOINT", "ST_DISTANCE", "ST_DUMP", "ST_DWITHIN", "ST_ENDPOINT", "ST_EQUALS", "ST_EXTENT", "ST_EXTERIORRING", "ST_GEOGFROM", "ST_GEOGFROMGEOJSON", "ST_GEOGFROMTEXT", "ST_GEOGFROMWKB", "ST_GEOGPOINT", "ST_GEOGPOINTFROMGEOHASH", "ST_GEOHASH", "ST_GEOMETRYTYPE", "ST_INTERIORRINGS", "ST_INTERSECTION", "ST_INTERSECTS", "ST_INTERSECTSBOX", "ST_ISCOLLECTION", "ST_ISEMPTY", "ST_LENGTH", "ST_MAKELINE", "ST_MAKEPOLYGON", "ST_MAKEPOLYGONORIENTED", "ST_MAXDISTANCE", "ST_NPOINTS", "ST_NUMGEOMETRIES", "ST_NUMPOINTS", "ST_PERIMETER", "ST_POINTN", "ST_SIMPLIFY", "ST_SNAPTOGRID", "ST_STARTPOINT", "ST_TOUCHES", "ST_UNION", "ST_UNION_AGG", "ST_WITHIN", "ST_X", "ST_Y"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/hash_functions
  hash: ["FARM_FINGERPRINT", "MD5", "SHA1", "SHA256", "SHA512"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/hll_functions
  hll: ["HLL_COUNT.INIT", "HLL_COUNT.MERGE", "HLL_COUNT.MERGE_PARTIAL", "HLL_COUNT.EXTRACT"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/interval_functions
  interval: ["MAKE_INTERVAL", "EXTRACT", "JUSTIFY_DAYS", "JUSTIFY_HOURS", "JUSTIFY_INTERVAL"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/json_functions
  json: ["JSON_EXTRACT", "JSON_QUERY", "JSON_EXTRACT_SCALAR", "JSON_VALUE", "JSON_EXTRACT_ARRAY", "JSON_QUERY_ARRAY", "JSON_EXTRACT_STRING_ARRAY", "JSON_VALUE_ARRAY", "TO_JSON_STRING"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/mathematical_functions
  math: ["ABS", "SIGN", "IS_INF", "IS_NAN", "IEEE_DIVIDE", "RAND", "SQRT", "POW", "POWER", "EXP", "LN", "LOG", "LOG10", "GREATEST", "LEAST", "DIV", "SAFE_DIVIDE", "SAFE_MULTIPLY", "SAFE_NEGATE", "SAFE_ADD", "SAFE_SUBTRACT", "MOD", "ROUND", "TRUNC", "CEIL", "CEILING", "FLOOR", "COS", "COSH", "ACOS", "ACOSH", "SIN", "SINH", "ASIN", "ASINH", "TAN", "TANH", "ATAN", "ATANH", "ATAN2", "RANGE_BUCKET"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/navigation_functions
  navigation: ["FIRST_VALUE", "LAST_VALUE", "NTH_VALUE", "LEAD", "LAG", "PERCENTILE_CONT", "PERCENTILE_DISC"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/net_functions
  net: ["NET.IP_FROM_STRING", "NET.SAFE_IP_FROM_STRING", "NET.IP_TO_STRING", "NET.IP_NET_MASK", "NET.IP_TRUNC", "NET.IPV4_FROM_INT64", "NET.IPV4_TO_INT64", "NET.HOST", "NET.PUBLIC_SUFFIX", "NET.REG_DOMAIN"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/numbering_functions
  numbering: ["RANK", "DENSE_RANK", "PERCENT_RANK", "CUME_DIST", "NTILE", "ROW_NUMBER"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/security_functions
  security: ["SESSION_USER"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/statistical_aggregate_functions
  statisticalAggregate: ["CORR", "COVAR_POP", "COVAR_SAMP", "STDDEV_POP", "STDDEV_SAMP", "STDDEV", "VAR_POP", "VAR_SAMP", "VARIANCE"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/string_functions
  string: ["ASCII", "BYTE_LENGTH", "CHAR_LENGTH", "CHARACTER_LENGTH", "CHR", "CODE_POINTS_TO_BYTES", "CODE_POINTS_TO_STRING", "CONCAT", "CONTAINS_SUBSTR", "ENDS_WITH", "FORMAT", "FROM_BASE32", "FROM_BASE64", "FROM_HEX", "INITCAP", "INSTR", "LEFT", "LENGTH", "LPAD", "LOWER", "LTRIM", "NORMALIZE", "NORMALIZE_AND_CASEFOLD", "OCTET_LENGTH", "REGEXP_CONTAINS", "REGEXP_EXTRACT", "REGEXP_EXTRACT_ALL", "REGEXP_INSTR", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REPLACE", "REPEAT", "REVERSE", "RIGHT", "RPAD", "RTRIM", "SAFE_CONVERT_BYTES_TO_STRING", "SOUNDEX", "SPLIT", "STARTS_WITH", "STRPOS", "SUBSTR", "SUBSTRING", "TO_BASE32", "TO_BASE64", "TO_CODE_POINTS", "TO_HEX", "TRANSLATE", "TRIM", "UNICODE", "UPPER"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/time_functions
  time: ["CURRENT_TIME", "TIME", "EXTRACT", "TIME_ADD", "TIME_SUB", "TIME_DIFF", "TIME_TRUNC", "FORMAT_TIME", "PARSE_TIME"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/timestamp_functions
  timestamp: ["CURRENT_TIMESTAMP", "EXTRACT", "STRING", "TIMESTAMP", "TIMESTAMP_ADD", "TIMESTAMP_SUB", "TIMESTAMP_DIFF", "TIMESTAMP_TRUNC", "FORMAT_TIMESTAMP", "PARSE_TIMESTAMP", "TIMESTAMP_SECONDS", "TIMESTAMP_MILLIS", "TIMESTAMP_MICROS", "UNIX_SECONDS", "UNIX_MILLIS", "UNIX_MICROS"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/uuid_functions
  uuid: ["GENERATE_UUID"],
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/conditional_expressions
  conditional: ["COALESCE", "IF", "IFNULL", "NULLIF"],
  // https://cloud.google.com/bigquery/docs/reference/legacy-sql
  legacyAggregate: ["AVG", "BIT_AND", "BIT_OR", "BIT_XOR", "CORR", "COUNT", "COVAR_POP", "COVAR_SAMP", "EXACT_COUNT_DISTINCT", "FIRST", "GROUP_CONCAT", "GROUP_CONCAT_UNQUOTED", "LAST", "MAX", "MIN", "NEST", "NTH", "QUANTILES", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "SUM", "TOP", "UNIQUE", "VARIANCE", "VAR_POP", "VAR_SAMP"],
  legacyBitwise: ["BIT_COUNT"],
  legacyCasting: ["BOOLEAN", "BYTES", "CAST", "FLOAT", "HEX_STRING", "INTEGER", "STRING"],
  legacyComparison: [
    // expr 'IN',
    "COALESCE",
    "GREATEST",
    "IFNULL",
    "IS_INF",
    "IS_NAN",
    "IS_EXPLICITLY_DEFINED",
    "LEAST",
    "NVL"
  ],
  legacyDatetime: ["CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "DATE", "DATE_ADD", "DATEDIFF", "DAY", "DAYOFWEEK", "DAYOFYEAR", "FORMAT_UTC_USEC", "HOUR", "MINUTE", "MONTH", "MSEC_TO_TIMESTAMP", "NOW", "PARSE_UTC_USEC", "QUARTER", "SEC_TO_TIMESTAMP", "SECOND", "STRFTIME_UTC_USEC", "TIME", "TIMESTAMP", "TIMESTAMP_TO_MSEC", "TIMESTAMP_TO_SEC", "TIMESTAMP_TO_USEC", "USEC_TO_TIMESTAMP", "UTC_USEC_TO_DAY", "UTC_USEC_TO_HOUR", "UTC_USEC_TO_MONTH", "UTC_USEC_TO_WEEK", "UTC_USEC_TO_YEAR", "WEEK", "YEAR"],
  legacyIp: ["FORMAT_IP", "PARSE_IP", "FORMAT_PACKED_IP", "PARSE_PACKED_IP"],
  legacyJson: ["JSON_EXTRACT", "JSON_EXTRACT_SCALAR"],
  legacyMath: ["ABS", "ACOS", "ACOSH", "ASIN", "ASINH", "ATAN", "ATANH", "ATAN2", "CEIL", "COS", "COSH", "DEGREES", "EXP", "FLOOR", "LN", "LOG", "LOG2", "LOG10", "PI", "POW", "RADIANS", "RAND", "ROUND", "SIN", "SINH", "SQRT", "TAN", "TANH"],
  legacyRegex: ["REGEXP_MATCH", "REGEXP_EXTRACT", "REGEXP_REPLACE"],
  legacyString: [
    "CONCAT",
    // expr CONTAINS 'str'
    "INSTR",
    "LEFT",
    "LENGTH",
    "LOWER",
    "LPAD",
    "LTRIM",
    "REPLACE",
    "RIGHT",
    "RPAD",
    "RTRIM",
    "SPLIT",
    "SUBSTR",
    "UPPER"
  ],
  legacyTableWildcard: ["TABLE_DATE_RANGE", "TABLE_DATE_RANGE_STRICT", "TABLE_QUERY"],
  legacyUrl: ["HOST", "DOMAIN", "TLD"],
  legacyWindow: ["AVG", "COUNT", "MAX", "MIN", "STDDEV", "SUM", "CUME_DIST", "DENSE_RANK", "FIRST_VALUE", "LAG", "LAST_VALUE", "LEAD", "NTH_VALUE", "NTILE", "PERCENT_RANK", "PERCENTILE_CONT", "PERCENTILE_DISC", "RANK", "RATIO_TO_REPORT", "ROW_NUMBER"],
  legacyMisc: ["CURRENT_USER", "EVERY", "FROM_BASE64", "HASH", "FARM_FINGERPRINT", "IF", "POSITION", "SHA1", "SOME", "TO_BASE64"],
  other: ["BQ.JOBS.CANCEL", "BQ.REFRESH_MATERIALIZED_VIEW"],
  ddl: ["OPTIONS"],
  pivot: ["PIVOT", "UNPIVOT"],
  // Data types with parameters like VARCHAR(100)
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#parameterized_data_types
  dataTypes: ["BYTES", "NUMERIC", "DECIMAL", "BIGNUMERIC", "BIGDECIMAL", "STRING"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/bigquery/bigquery.formatter.js
var reservedSelect = expandPhrases(["SELECT [ALL | DISTINCT] [AS STRUCT | AS VALUE]"]);
var reservedClauses = expandPhrases([
  // Queries: https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "QUALIFY",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "OMIT RECORD IF",
  // legacy
  // Data modification: https://cloud.google.com/bigquery/docs/reference/standard-sql/dml-syntax
  // - insert:
  "INSERT [INTO]",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE [INTO]",
  "WHEN [NOT] MATCHED [BY SOURCE | BY TARGET] [THEN]",
  "UPDATE SET",
  // Data definition, https://cloud.google.com/bigquery/docs/reference/standard-sql/data-definition-language
  "CREATE [OR REPLACE] [MATERIALIZED] VIEW [IF NOT EXISTS]",
  "CREATE [OR REPLACE] [TEMP|TEMPORARY|SNAPSHOT|EXTERNAL] TABLE [IF NOT EXISTS]",
  "CLUSTER BY",
  "FOR SYSTEM_TIME AS OF",
  // CREATE SNAPSHOT TABLE
  "WITH CONNECTION",
  "WITH PARTITION COLUMNS",
  "REMOTE WITH CONNECTION"
]);
var onelineClauses = expandPhrases([
  // - update:
  "UPDATE",
  // - delete:
  "DELETE [FROM]",
  // - drop table:
  "DROP [SNAPSHOT | EXTERNAL] TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE [IF EXISTS]",
  "ADD COLUMN [IF NOT EXISTS]",
  "DROP COLUMN [IF EXISTS]",
  "RENAME TO",
  "ALTER COLUMN [IF EXISTS]",
  "SET DEFAULT COLLATE",
  // for alter column
  "SET OPTIONS",
  // for alter column
  "DROP NOT NULL",
  // for alter column
  "SET DATA TYPE",
  // for alter column
  // - alter schema
  "ALTER SCHEMA [IF EXISTS]",
  // - alter view
  "ALTER [MATERIALIZED] VIEW [IF EXISTS]",
  // - alter bi_capacity
  "ALTER BI_CAPACITY",
  // - truncate:
  "TRUNCATE TABLE",
  // - create schema
  "CREATE SCHEMA [IF NOT EXISTS]",
  "DEFAULT COLLATE",
  // stored procedures
  "CREATE [OR REPLACE] [TEMP|TEMPORARY|TABLE] FUNCTION [IF NOT EXISTS]",
  "CREATE [OR REPLACE] PROCEDURE [IF NOT EXISTS]",
  // row access policy
  "CREATE [OR REPLACE] ROW ACCESS POLICY [IF NOT EXISTS]",
  "GRANT TO",
  "FILTER USING",
  // capacity
  "CREATE CAPACITY",
  "AS JSON",
  // reservation
  "CREATE RESERVATION",
  // assignment
  "CREATE ASSIGNMENT",
  // search index
  "CREATE SEARCH INDEX [IF NOT EXISTS]",
  // drop
  "DROP SCHEMA [IF EXISTS]",
  "DROP [MATERIALIZED] VIEW [IF EXISTS]",
  "DROP [TABLE] FUNCTION [IF EXISTS]",
  "DROP PROCEDURE [IF EXISTS]",
  "DROP ROW ACCESS POLICY",
  "DROP ALL ROW ACCESS POLICIES",
  "DROP CAPACITY [IF EXISTS]",
  "DROP RESERVATION [IF EXISTS]",
  "DROP ASSIGNMENT [IF EXISTS]",
  "DROP SEARCH INDEX [IF EXISTS]",
  "DROP [IF EXISTS]",
  // DCL, https://cloud.google.com/bigquery/docs/reference/standard-sql/data-control-language
  "GRANT",
  "REVOKE",
  // Script, https://cloud.google.com/bigquery/docs/reference/standard-sql/scripting
  "DECLARE",
  "EXECUTE IMMEDIATE",
  "LOOP",
  "END LOOP",
  "REPEAT",
  "END REPEAT",
  "WHILE",
  "END WHILE",
  "BREAK",
  "LEAVE",
  "CONTINUE",
  "ITERATE",
  "FOR",
  "END FOR",
  "BEGIN",
  "BEGIN TRANSACTION",
  "COMMIT TRANSACTION",
  "ROLLBACK TRANSACTION",
  "RAISE",
  "RETURN",
  "CALL",
  // Debug, https://cloud.google.com/bigquery/docs/reference/standard-sql/debugging-statements
  "ASSERT",
  // Other, https://cloud.google.com/bigquery/docs/reference/standard-sql/other-statements
  "EXPORT DATA"
]);
var reservedSetOperations = expandPhrases(["UNION {ALL | DISTINCT}", "EXCEPT DISTINCT", "INTERSECT DISTINCT"]);
var reservedJoins = expandPhrases(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN"]);
var reservedPhrases = expandPhrases([
  // https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#tablesample_operator
  "TABLESAMPLE SYSTEM",
  // From DDL: https://cloud.google.com/bigquery/docs/reference/standard-sql/data-definition-language
  "ANY TYPE",
  "ALL COLUMNS",
  "NOT DETERMINISTIC",
  // inside window definitions
  "{ROWS | RANGE} BETWEEN",
  // comparison operator
  "IS [NOT] DISTINCT FROM"
]);
var bigquery = {
  tokenizerOptions: {
    reservedSelect,
    reservedClauses: [...reservedClauses, ...onelineClauses],
    reservedSetOperations,
    reservedJoins,
    reservedPhrases,
    reservedKeywords: keywords,
    reservedFunctionNames: functions,
    extraParens: ["[]"],
    stringTypes: [
      // The triple-quoted strings are listed first, so they get matched first.
      // Otherwise the first two quotes of """ will get matched as an empty "" string.
      {
        quote: '""".."""',
        prefixes: ["R", "B", "RB", "BR"]
      },
      {
        quote: "'''..'''",
        prefixes: ["R", "B", "RB", "BR"]
      },
      '""-bs',
      "''-bs",
      {
        quote: '""-raw',
        prefixes: ["R", "B", "RB", "BR"],
        requirePrefix: true
      },
      {
        quote: "''-raw",
        prefixes: ["R", "B", "RB", "BR"],
        requirePrefix: true
      }
    ],
    identTypes: ["``"],
    identChars: {
      dashes: true
    },
    paramTypes: {
      positional: true,
      named: ["@"],
      quoted: ["@"]
    },
    variableTypes: [{
      regex: String.raw`@@\w+`
    }],
    lineCommentTypes: ["--", "#"],
    operators: ["&", "|", "^", "~", ">>", "<<", "||", "=>"],
    postProcess
  },
  formatOptions: {
    onelineClauses
  }
};
function postProcess(tokens) {
  return detectArraySubscripts(combineParameterizedTypes(tokens));
}
function detectArraySubscripts(tokens) {
  let prevToken = EOF_TOKEN;
  return tokens.map((token) => {
    if (token.text === "OFFSET" && prevToken.text === "[") {
      prevToken = token;
      return {
        ...token,
        type: TokenType.RESERVED_FUNCTION_NAME
      };
    } else {
      prevToken = token;
      return token;
    }
  });
}
function combineParameterizedTypes(tokens) {
  const processed = [];
  for (let i = 0; i < tokens.length; i++) {
    var _tokens;
    const token = tokens[i];
    if ((isToken.ARRAY(token) || isToken.STRUCT(token)) && ((_tokens = tokens[i + 1]) === null || _tokens === void 0 ? void 0 : _tokens.text) === "<") {
      const endIndex = findClosingAngleBracketIndex(tokens, i + 1);
      const typeDefTokens = tokens.slice(i, endIndex + 1);
      processed.push({
        type: TokenType.IDENTIFIER,
        raw: typeDefTokens.map(formatTypeDefToken("raw")).join(""),
        text: typeDefTokens.map(formatTypeDefToken("text")).join(""),
        start: token.start
      });
      i = endIndex;
    } else {
      processed.push(token);
    }
  }
  return processed;
}
var formatTypeDefToken = (key) => (token) => {
  if (token.type === TokenType.IDENTIFIER || token.type === TokenType.COMMA) {
    return token[key] + " ";
  } else {
    return token[key];
  }
};
function findClosingAngleBracketIndex(tokens, startIndex) {
  let level = 0;
  for (let i = startIndex; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.text === "<") {
      level++;
    } else if (token.text === ">") {
      level--;
    } else if (token.text === ">>") {
      level -= 2;
    }
    if (level === 0) {
      return i;
    }
  }
  return tokens.length - 1;
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/db2/db2.functions.js
var functions2 = flatKeywordList({
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=functions-aggregate
  aggregate: ["ARRAY_AGG", "AVG", "CORR", "CORRELATION", "COUNT", "COUNT_BIG", "COVAR_POP", "COVARIANCE", "COVAR", "COVAR_SAMP", "COVARIANCE_SAMP", "CUME_DIST", "GROUPING", "LISTAGG", "MAX", "MEDIAN", "MIN", "PERCENTILE_CONT", "PERCENTILE_DISC", "PERCENT_RANK", "REGR_AVGX", "REGR_AVGY", "REGR_COUNT", "REGR_INTERCEPT", "REGR_ICPT", "REGR_R2", "REGR_SLOPE", "REGR_SXX", "REGR_SXY", "REGR_SYY", "STDDEV_POP", "STDDEV", "STDDEV_SAMP", "SUM", "VAR_POP", "VARIANCE", "VAR", "VAR_SAMP", "VARIANCE_SAMP", "XMLAGG"],
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=functions-scalar
  scalar: ["ABS", "ABSVAL", "ACOS", "ADD_DAYS", "ADD_MONTHS", "ARRAY_DELETE", "ARRAY_FIRST", "ARRAY_LAST", "ARRAY_NEXT", "ARRAY_PRIOR", "ARRAY_TRIM", "ASCII", "ASCII_CHR", "ASCII_STR", "ASCIISTR", "ASIN", "ATAN", "ATANH", "ATAN2", "BIGINT", "BINARY", "BITAND", "BITANDNOT", "BITOR", "BITXOR", "BITNOT", "BLOB", "BTRIM", "CARDINALITY", "CCSID_ENCODING", "CEILING", "CEIL", "CHAR", "CHAR9", "CHARACTER_LENGTH", "CHAR_LENGTH", "CHR", "CLOB", "COALESCE", "COLLATION_KEY", "COMPARE_DECFLOAT", "CONCAT", "CONTAINS", "COS", "COSH", "DATE", "DAY", "DAYOFMONTH", "DAYOFWEEK", "DAYOFWEEK_ISO", "DAYOFYEAR", "DAYS", "DAYS_BETWEEN", "DBCLOB", "DECFLOAT", "DECFLOAT_FORMAT", "DECFLOAT_SORTKEY", "DECIMAL", "DEC", "DECODE", "DECRYPT_BINARY", "DECRYPT_BIT", "DECRYPT_CHAR", "DECRYPT_DB", "DECRYPT_DATAKEY_BIGINT", "DECRYPT_DATAKEY_BIT", "DECRYPT_DATAKEY_CLOB", "DECRYPT_DATAKEY_DBCLOB", "DECRYPT_DATAKEY_DECIMAL", "DECRYPT_DATAKEY_INTEGER", "DECRYPT_DATAKEY_VARCHAR", "DECRYPT_DATAKEY_VARGRAPHIC", "DEGREES", "DIFFERENCE", "DIGITS", "DOUBLE_PRECISION", "DOUBLE", "DSN_XMLVALIDATE", "EBCDIC_CHR", "EBCDIC_STR", "ENCRYPT_DATAKEY", "ENCRYPT_TDES", "EXP", "EXTRACT", "FLOAT", "FLOOR", "GENERATE_UNIQUE", "GENERATE_UNIQUE_BINARY", "GETHINT", "GETVARIABLE", "GRAPHIC", "GREATEST", "HASH", "HASH_CRC32", "HASH_MD5", "HASH_SHA1", "HASH_SHA256", "HEX", "HOUR", "IDENTITY_VAL_LOCAL", "IFNULL", "INSERT", "INSTR", "INTEGER", "INT", "JULIAN_DAY", "LAST_DAY", "LCASE", "LEAST", "LEFT", "LENGTH", "LN", "LOCATE", "LOCATE_IN_STRING", "LOG10", "LOWER", "LPAD", "LTRIM", "MAX", "MAX_CARDINALITY", "MICROSECOND", "MIDNIGHT_SECONDS", "MIN", "MINUTE", "MOD", "MONTH", "MONTHS_BETWEEN", "MQREAD", "MQREADCLOB", "MQRECEIVE", "MQRECEIVECLOB", "MQSEND", "MULTIPLY_ALT", "NEXT_DAY", "NEXT_MONTH", "NORMALIZE_DECFLOAT", "NORMALIZE_STRING", "NULLIF", "NVL", "OVERLAY", "PACK", "POSITION", "POSSTR", "POWER", "POW", "QUANTIZE", "QUARTER", "RADIANS", "RAISE_ERROR", "RANDOM", "RAND", "REAL", "REGEXP_COUNT", "REGEXP_INSTR", "REGEXP_LIKE", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REPEAT", "REPLACE", "RID", "RIGHT", "ROUND", "ROUND_TIMESTAMP", "ROWID", "RPAD", "RTRIM", "SCORE", "SECOND", "SIGN", "SIN", "SINH", "SMALLINT", "SOUNDEX", "SOAPHTTPC", "SOAPHTTPV", "SOAPHTTPNC", "SOAPHTTPNV", "SPACE", "SQRT", "STRIP", "STRLEFT", "STRPOS", "STRRIGHT", "SUBSTR", "SUBSTRING", "TAN", "TANH", "TIME", "TIMESTAMP", "TIMESTAMPADD", "TIMESTAMPDIFF", "TIMESTAMP_FORMAT", "TIMESTAMP_ISO", "TIMESTAMP_TZ", "TO_CHAR", "TO_CLOB", "TO_DATE", "TO_NUMBER", "TOTALORDER", "TO_TIMESTAMP", "TRANSLATE", "TRIM", "TRIM_ARRAY", "TRUNCATE", "TRUNC", "TRUNC_TIMESTAMP", "UCASE", "UNICODE", "UNICODE_STR", "UNISTR", "UPPER", "VALUE", "VARBINARY", "VARCHAR", "VARCHAR9", "VARCHAR_BIT_FORMAT", "VARCHAR_FORMAT", "VARGRAPHIC", "VERIFY_GROUP_FOR_USER", "VERIFY_ROLE_FOR_USER", "VERIFY_TRUSTED_CONTEXT_ROLE_FOR_USER", "WEEK", "WEEK_ISO", "WRAP", "XMLATTRIBUTES", "XMLCOMMENT", "XMLCONCAT", "XMLDOCUMENT", "XMLELEMENT", "XMLFOREST", "XMLMODIFY", "XMLNAMESPACES", "XMLPARSE", "XMLPI", "XMLQUERY", "XMLSERIALIZE", "XMLTEXT", "XMLXSROBJECTID", "XSLTRANSFORM", "YEAR"],
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=functions-table
  table: ["ADMIN_TASK_LIST", "ADMIN_TASK_OUTPUT", "ADMIN_TASK_STATUS", "BLOCKING_THREADS", "MQREADALL", "MQREADALLCLOB", "MQRECEIVEALL", "MQRECEIVEALLCLOB", "XMLTABLE"],
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=functions-row
  row: ["UNPACK"],
  // https://www.ibm.com/docs/en/db2-for-zos/12?topic=expressions-olap-specification
  olap: ["CUME_DIST", "PERCENT_RANK", "RANK", "DENSE_RANK", "NTILE", "LAG", "LEAD", "ROW_NUMBER", "FIRST_VALUE", "LAST_VALUE", "NTH_VALUE", "RATIO_TO_REPORT"],
  // Type casting
  cast: ["CAST"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/db2/db2.keywords.js
var keywords2 = flatKeywordList({
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=words-reserved#db2z_reservedwords__newresword
  standard: ["ALL", "ALLOCATE", "ALLOW", "ALTERAND", "ANY", "AS", "ARRAY", "ARRAY_EXISTS", "ASENSITIVE", "ASSOCIATE", "ASUTIME", "AT", "AUDIT", "AUX", "AUXILIARY", "BEFORE", "BEGIN", "BETWEEN", "BUFFERPOOL", "BY", "CAPTURE", "CASCADED", "CAST", "CCSID", "CHARACTER", "CHECK", "CLONE", "CLUSTER", "COLLECTION", "COLLID", "COLUMN", "CONDITION", "CONNECTION", "CONSTRAINT", "CONTENT", "CONTINUE", "CREATE", "CUBE", "CURRENT", "CURRENT_DATE", "CURRENT_LC_CTYPE", "CURRENT_PATH", "CURRENT_SCHEMA", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRVAL", "CURSOR", "DATA", "DATABASE", "DBINFO", "DECLARE", "DEFAULT", "DESCRIPTOR", "DETERMINISTIC", "DISABLE", "DISALLOW", "DISTINCT", "DO", "DOCUMENT", "DSSIZE", "DYNAMIC", "EDITPROC", "ELSE", "ELSEIF", "ENCODING", "ENCRYPTION", "ENDING", "END-EXEC", "ERASE", "ESCAPE", "EXCEPTION", "EXISTS", "EXIT", "EXTERNAL", "FENCED", "FIELDPROC", "FINAL", "FIRST", "FOR", "FREE", "FULL", "FUNCTION", "GENERATED", "GET", "GLOBAL", "GOTO", "GROUP", "HANDLER", "HOLD", "HOURS", "IF", "IMMEDIATE", "IN", "INCLUSIVE", "INDEX", "INHERIT", "INNER", "INOUT", "INSENSITIVE", "INTO", "IS", "ISOBID", "ITERATE", "JAR", "KEEP", "KEY", "LANGUAGE", "LAST", "LC_CTYPE", "LEAVE", "LIKE", "LOCAL", "LOCALE", "LOCATOR", "LOCATORS", "LOCK", "LOCKMAX", "LOCKSIZE", "LONG", "LOOP", "MAINTAINED", "MATERIALIZED", "MICROSECONDS", "MINUTEMINUTES", "MODIFIES", "MONTHS", "NEXT", "NEXTVAL", "NO", "NONE", "NOT", "NULL", "NULLS", "NUMPARTS", "OBID", "OF", "OLD", "ON", "OPTIMIZATION", "OPTIMIZE", "ORDER", "ORGANIZATION", "OUT", "OUTER", "PACKAGE", "PARAMETER", "PART", "PADDED", "PARTITION", "PARTITIONED", "PARTITIONING", "PATH", "PIECESIZE", "PERIOD", "PLAN", "PRECISION", "PREVVAL", "PRIOR", "PRIQTY", "PRIVILEGES", "PROCEDURE", "PROGRAM", "PSID", "PUBLIC", "QUERY", "QUERYNO", "READS", "REFERENCES", "RESIGNAL", "RESTRICT", "RESULT", "RESULT_SET_LOCATOR", "RETURN", "RETURNS", "ROLE", "ROLLUP", "ROUND_CEILING", "ROUND_DOWN", "ROUND_FLOOR", "ROUND_HALF_DOWN", "ROUND_HALF_EVEN", "ROUND_HALF_UP", "ROUND_UP", "ROW", "ROWSET", "SCHEMA", "SCRATCHPAD", "SECONDS", "SECQTY", "SECURITY", "SEQUENCE", "SENSITIVE", "SESSION_USER", "SIMPLE", "SOME", "SOURCE", "SPECIFIC", "STANDARD", "STATIC", "STATEMENT", "STAY", "STOGROUP", "STORES", "STYLE", "SUMMARY", "SYNONYM", "SYSDATE", "SYSTEM", "SYSTIMESTAMP", "TABLE", "TABLESPACE", "THEN", "TO", "TRIGGER", "TYPE", "UNDO", "UNIQUE", "UNTIL", "USER", "USING", "VALIDPROC", "VARIABLE", "VARIANT", "VCAT", "VERSIONING", "VIEW", "VOLATILE", "VOLUMES", "WHILE", "WLM", "XMLEXISTS", "XMLCAST", "YEARS", "ZONE"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/db2/db2.formatter.js
var reservedSelect2 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses2 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER BY [INPUT SEQUENCE]",
  "FETCH FIRST",
  // Data modification
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE INTO",
  "WHEN [NOT] MATCHED [THEN]",
  "UPDATE SET",
  "INSERT",
  // Data definition
  "CREATE [OR REPLACE] VIEW",
  "CREATE [GLOBAL TEMPORARY] TABLE"
]);
var onelineClauses2 = expandPhrases([
  // - update:
  "UPDATE",
  "WHERE CURRENT OF",
  "WITH {RR | RS | CS | UR}",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [HIERARCHY]",
  // alter table:
  "ALTER TABLE",
  "ADD [COLUMN]",
  "DROP [COLUMN]",
  "RENAME [COLUMN]",
  "ALTER [COLUMN]",
  "SET DATA TYPE",
  // for alter column
  "SET NOT NULL",
  // for alter column
  "DROP {IDENTITY | EXPRESSION | DEFAULT | NOT NULL}",
  // for alter column
  // - truncate:
  "TRUNCATE [TABLE]",
  // other
  "SET [CURRENT] SCHEMA",
  "AFTER",
  "GO",
  // https://www.ibm.com/docs/en/db2-for-zos/11?topic=statements-list-supported
  "ALLOCATE CURSOR",
  "ALTER DATABASE",
  "ALTER FUNCTION",
  "ALTER INDEX",
  "ALTER MASK",
  "ALTER PERMISSION",
  "ALTER PROCEDURE",
  "ALTER SEQUENCE",
  "ALTER STOGROUP",
  "ALTER TABLESPACE",
  "ALTER TRIGGER",
  "ALTER TRUSTED CONTEXT",
  "ALTER VIEW",
  "ASSOCIATE LOCATORS",
  "BEGIN DECLARE SECTION",
  "CALL",
  "CLOSE",
  "COMMENT",
  "COMMIT",
  "CONNECT",
  "CREATE ALIAS",
  "CREATE AUXILIARY TABLE",
  "CREATE DATABASE",
  "CREATE FUNCTION",
  "CREATE GLOBAL TEMPORARY TABLE",
  "CREATE INDEX",
  "CREATE LOB TABLESPACE",
  "CREATE MASK",
  "CREATE PERMISSION",
  "CREATE PROCEDURE",
  "CREATE ROLE",
  "CREATE SEQUENCE",
  "CREATE STOGROUP",
  "CREATE SYNONYM",
  "CREATE TABLESPACE",
  "CREATE TRIGGER",
  "CREATE TRUSTED CONTEXT",
  "CREATE TYPE",
  "CREATE VARIABLE",
  "DECLARE CURSOR",
  "DECLARE GLOBAL TEMPORARY TABLE",
  "DECLARE STATEMENT",
  "DECLARE TABLE",
  "DECLARE VARIABLE",
  "DESCRIBE CURSOR",
  "DESCRIBE INPUT",
  "DESCRIBE OUTPUT",
  "DESCRIBE PROCEDURE",
  "DESCRIBE TABLE",
  "DROP",
  "END DECLARE SECTION",
  "EXCHANGE",
  "EXECUTE",
  "EXECUTE IMMEDIATE",
  "EXPLAIN",
  "FETCH",
  "FREE LOCATOR",
  "GET DIAGNOSTICS",
  "GRANT",
  "HOLD LOCATOR",
  "INCLUDE",
  "LABEL",
  "LOCK TABLE",
  "OPEN",
  "PREPARE",
  "REFRESH",
  "RELEASE",
  "RELEASE SAVEPOINT",
  "RENAME",
  "REVOKE",
  "ROLLBACK",
  "SAVEPOINT",
  "SELECT INTO",
  "SET CONNECTION",
  "SET CURRENT ACCELERATOR",
  "SET CURRENT APPLICATION COMPATIBILITY",
  "SET CURRENT APPLICATION ENCODING SCHEME",
  "SET CURRENT DEBUG MODE",
  "SET CURRENT DECFLOAT ROUNDING MODE",
  "SET CURRENT DEGREE",
  "SET CURRENT EXPLAIN MODE",
  "SET CURRENT GET_ACCEL_ARCHIVE",
  "SET CURRENT LOCALE LC_CTYPE",
  "SET CURRENT MAINTAINED TABLE TYPES FOR OPTIMIZATION",
  "SET CURRENT OPTIMIZATION HINT",
  "SET CURRENT PACKAGE PATH",
  "SET CURRENT PACKAGESET",
  "SET CURRENT PRECISION",
  "SET CURRENT QUERY ACCELERATION",
  "SET CURRENT QUERY ACCELERATION WAITFORDATA",
  "SET CURRENT REFRESH AGE",
  "SET CURRENT ROUTINE VERSION",
  "SET CURRENT RULES",
  "SET CURRENT SQLID",
  "SET CURRENT TEMPORAL BUSINESS_TIME",
  "SET CURRENT TEMPORAL SYSTEM_TIME",
  "SET ENCRYPTION PASSWORD",
  "SET PATH",
  "SET SESSION TIME ZONE",
  "SIGNAL",
  "VALUES INTO",
  "WHENEVER"
]);
var reservedSetOperations2 = expandPhrases(["UNION [ALL]", "EXCEPT [ALL]", "INTERSECT [ALL]"]);
var reservedJoins2 = expandPhrases(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN"]);
var reservedPhrases2 = expandPhrases(["ON DELETE", "ON UPDATE", "SET NULL", "{ROWS | RANGE} BETWEEN"]);
var db2 = {
  tokenizerOptions: {
    reservedSelect: reservedSelect2,
    reservedClauses: [...reservedClauses2, ...onelineClauses2],
    reservedSetOperations: reservedSetOperations2,
    reservedJoins: reservedJoins2,
    reservedPhrases: reservedPhrases2,
    reservedKeywords: keywords2,
    reservedFunctionNames: functions2,
    stringTypes: [{
      quote: "''-qq",
      prefixes: ["G", "N", "U&"]
    }, {
      quote: "''-raw",
      prefixes: ["X", "BX", "GX", "UX"],
      requirePrefix: true
    }],
    identTypes: [`""-qq`],
    identChars: {
      first: "@#$"
    },
    paramTypes: {
      positional: true,
      named: [":"]
    },
    paramChars: {
      first: "@#$",
      rest: "@#$"
    },
    operators: ["**", "\xAC=", "\xAC>", "\xAC<", "!>", "!<", "||"]
  },
  formatOptions: {
    onelineClauses: onelineClauses2
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/hive/hive.functions.js
var functions3 = flatKeywordList({
  // https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF
  math: [
    "ABS",
    "ACOS",
    "ASIN",
    "ATAN",
    "BIN",
    "BROUND",
    "CBRT",
    "CEIL",
    "CEILING",
    "CONV",
    "COS",
    "DEGREES",
    // 'E',
    "EXP",
    "FACTORIAL",
    "FLOOR",
    "GREATEST",
    "HEX",
    "LEAST",
    "LN",
    "LOG",
    "LOG10",
    "LOG2",
    "NEGATIVE",
    "PI",
    "PMOD",
    "POSITIVE",
    "POW",
    "POWER",
    "RADIANS",
    "RAND",
    "ROUND",
    "SHIFTLEFT",
    "SHIFTRIGHT",
    "SHIFTRIGHTUNSIGNED",
    "SIGN",
    "SIN",
    "SQRT",
    "TAN",
    "UNHEX",
    "WIDTH_BUCKET"
  ],
  array: ["ARRAY_CONTAINS", "MAP_KEYS", "MAP_VALUES", "SIZE", "SORT_ARRAY"],
  conversion: ["BINARY", "CAST"],
  date: ["ADD_MONTHS", "DATE", "DATE_ADD", "DATE_FORMAT", "DATE_SUB", "DATEDIFF", "DAY", "DAYNAME", "DAYOFMONTH", "DAYOFYEAR", "EXTRACT", "FROM_UNIXTIME", "FROM_UTC_TIMESTAMP", "HOUR", "LAST_DAY", "MINUTE", "MONTH", "MONTHS_BETWEEN", "NEXT_DAY", "QUARTER", "SECOND", "TIMESTAMP", "TO_DATE", "TO_UTC_TIMESTAMP", "TRUNC", "UNIX_TIMESTAMP", "WEEKOFYEAR", "YEAR"],
  conditional: ["ASSERT_TRUE", "COALESCE", "IF", "ISNOTNULL", "ISNULL", "NULLIF", "NVL"],
  string: ["ASCII", "BASE64", "CHARACTER_LENGTH", "CHR", "CONCAT", "CONCAT_WS", "CONTEXT_NGRAMS", "DECODE", "ELT", "ENCODE", "FIELD", "FIND_IN_SET", "FORMAT_NUMBER", "GET_JSON_OBJECT", "IN_FILE", "INITCAP", "INSTR", "LCASE", "LENGTH", "LEVENSHTEIN", "LOCATE", "LOWER", "LPAD", "LTRIM", "NGRAMS", "OCTET_LENGTH", "PARSE_URL", "PRINTF", "QUOTE", "REGEXP_EXTRACT", "REGEXP_REPLACE", "REPEAT", "REVERSE", "RPAD", "RTRIM", "SENTENCES", "SOUNDEX", "SPACE", "SPLIT", "STR_TO_MAP", "SUBSTR", "SUBSTRING", "TRANSLATE", "TRIM", "UCASE", "UNBASE64", "UPPER"],
  masking: ["MASK", "MASK_FIRST_N", "MASK_HASH", "MASK_LAST_N", "MASK_SHOW_FIRST_N", "MASK_SHOW_LAST_N"],
  misc: ["AES_DECRYPT", "AES_ENCRYPT", "CRC32", "CURRENT_DATABASE", "CURRENT_USER", "HASH", "JAVA_METHOD", "LOGGED_IN_USER", "MD5", "REFLECT", "SHA", "SHA1", "SHA2", "SURROGATE_KEY", "VERSION"],
  aggregate: ["AVG", "COLLECT_LIST", "COLLECT_SET", "CORR", "COUNT", "COVAR_POP", "COVAR_SAMP", "HISTOGRAM_NUMERIC", "MAX", "MIN", "NTILE", "PERCENTILE", "PERCENTILE_APPROX", "REGR_AVGX", "REGR_AVGY", "REGR_COUNT", "REGR_INTERCEPT", "REGR_R2", "REGR_SLOPE", "REGR_SXX", "REGR_SXY", "REGR_SYY", "STDDEV_POP", "STDDEV_SAMP", "SUM", "VAR_POP", "VAR_SAMP", "VARIANCE"],
  table: ["EXPLODE", "INLINE", "JSON_TUPLE", "PARSE_URL_TUPLE", "POSEXPLODE", "STACK"],
  // https://cwiki.apache.org/confluence/display/Hive/LanguageManual+WindowingAndAnalytics
  window: ["LEAD", "LAG", "FIRST_VALUE", "LAST_VALUE", "RANK", "ROW_NUMBER", "DENSE_RANK", "CUME_DIST", "PERCENT_RANK", "NTILE"],
  // Parameterized data types
  // https://cwiki.apache.org/confluence/pages/viewpage.action?pageId=82706456
  // Though in reality Hive only supports parameters for DECIMAL(),
  // it doesn't hurt to allow others in here as well.
  dataTypes: ["DECIMAL", "NUMERIC", "VARCHAR", "CHAR"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/hive/hive.keywords.js
var keywords3 = flatKeywordList({
  // https://cwiki.apache.org/confluence/display/hive/languagemanual+ddl
  // Non-reserved keywords have proscribed meanings in. HiveQL, but can still be used as table or column names
  nonReserved: ["ADD", "ADMIN", "AFTER", "ANALYZE", "ARCHIVE", "ASC", "BEFORE", "BUCKET", "BUCKETS", "CASCADE", "CHANGE", "CLUSTER", "CLUSTERED", "CLUSTERSTATUS", "COLLECTION", "COLUMNS", "COMMENT", "COMPACT", "COMPACTIONS", "COMPUTE", "CONCATENATE", "CONTINUE", "DATA", "DATABASES", "DATETIME", "DAY", "DBPROPERTIES", "DEFERRED", "DEFINED", "DELIMITED", "DEPENDENCY", "DESC", "DIRECTORIES", "DIRECTORY", "DISABLE", "DISTRIBUTE", "ELEM_TYPE", "ENABLE", "ESCAPED", "EXCLUSIVE", "EXPLAIN", "EXPORT", "FIELDS", "FILE", "FILEFORMAT", "FIRST", "FORMAT", "FORMATTED", "FUNCTIONS", "HOLD_DDLTIME", "HOUR", "IDXPROPERTIES", "IGNORE", "INDEX", "INDEXES", "INPATH", "INPUTDRIVER", "INPUTFORMAT", "ITEMS", "JAR", "KEYS", "KEY_TYPE", "LIMIT", "LINES", "LOAD", "LOCATION", "LOCK", "LOCKS", "LOGICAL", "LONG", "MAPJOIN", "MATERIALIZED", "METADATA", "MINUS", "MINUTE", "MONTH", "MSCK", "NOSCAN", "NO_DROP", "OFFLINE", "OPTION", "OUTPUTDRIVER", "OUTPUTFORMAT", "OVERWRITE", "OWNER", "PARTITIONED", "PARTITIONS", "PLUS", "PRETTY", "PRINCIPALS", "PROTECTION", "PURGE", "READ", "READONLY", "REBUILD", "RECORDREADER", "RECORDWRITER", "RELOAD", "RENAME", "REPAIR", "REPLACE", "REPLICATION", "RESTRICT", "REWRITE", "ROLE", "ROLES", "SCHEMA", "SCHEMAS", "SECOND", "SEMI", "SERDE", "SERDEPROPERTIES", "SERVER", "SETS", "SHARED", "SHOW", "SHOW_DATABASE", "SKEWED", "SORT", "SORTED", "SSL", "STATISTICS", "STORED", "STREAMTABLE", "STRING", "STRUCT", "TABLES", "TBLPROPERTIES", "TEMPORARY", "TERMINATED", "TINYINT", "TOUCH", "TRANSACTIONS", "UNARCHIVE", "UNDO", "UNIONTYPE", "UNLOCK", "UNSET", "UNSIGNED", "URI", "USE", "UTC", "UTCTIMESTAMP", "VALUE_TYPE", "VIEW", "WHILE", "YEAR", "AUTOCOMMIT", "ISOLATION", "LEVEL", "OFFSET", "SNAPSHOT", "TRANSACTION", "WORK", "WRITE", "ABORT", "KEY", "LAST", "NORELY", "NOVALIDATE", "NULLS", "RELY", "VALIDATE", "DETAIL", "DOW", "EXPRESSION", "OPERATOR", "QUARTER", "SUMMARY", "VECTORIZATION", "WEEK", "YEARS", "MONTHS", "WEEKS", "DAYS", "HOURS", "MINUTES", "SECONDS", "TIMESTAMPTZ", "ZONE"],
  reserved: ["ALL", "ALTER", "AND", "ARRAY", "AS", "AUTHORIZATION", "BETWEEN", "BIGINT", "BINARY", "BOOLEAN", "BOTH", "BY", "CASE", "CAST", "CHAR", "COLUMN", "CONF", "CREATE", "CROSS", "CUBE", "CURRENT", "CURRENT_DATE", "CURRENT_TIMESTAMP", "CURSOR", "DATABASE", "DATE", "DECIMAL", "DELETE", "DESCRIBE", "DISTINCT", "DOUBLE", "DROP", "ELSE", "END", "EXCHANGE", "EXISTS", "EXTENDED", "EXTERNAL", "FALSE", "FETCH", "FLOAT", "FOLLOWING", "FOR", "FROM", "FULL", "FUNCTION", "GRANT", "GROUP", "GROUPING", "HAVING", "IF", "IMPORT", "IN", "INNER", "INSERT", "INT", "INTERSECT", "INTERVAL", "INTO", "IS", "JOIN", "LATERAL", "LEFT", "LESS", "LIKE", "LOCAL", "MACRO", "MAP", "MORE", "NONE", "NOT", "NULL", "OF", "ON", "OR", "ORDER", "OUT", "OUTER", "OVER", "PARTIALSCAN", "PARTITION", "PERCENT", "PRECEDING", "PRESERVE", "PROCEDURE", "RANGE", "READS", "REDUCE", "REVOKE", "RIGHT", "ROLLUP", "ROW", "ROWS", "SELECT", "SET", "SMALLINT", "TABLE", "TABLESAMPLE", "THEN", "TIMESTAMP", "TO", "TRANSFORM", "TRIGGER", "TRUE", "TRUNCATE", "UNBOUNDED", "UNION", "UNIQUEJOIN", "UPDATE", "USER", "USING", "UTC_TMESTAMP", "VALUES", "VARCHAR", "WHEN", "WHERE", "WINDOW", "WITH", "COMMIT", "ONLY", "REGEXP", "RLIKE", "ROLLBACK", "START", "CACHE", "CONSTRAINT", "FOREIGN", "PRIMARY", "REFERENCES", "DAYOFWEEK", "EXTRACT", "FLOOR", "INTEGER", "PRECISION", "VIEWS", "TIME", "NUMERIC", "SYNC"],
  fileTypes: ["TEXTFILE", "SEQUENCEFILE", "ORC", "CSV", "TSV", "PARQUET", "AVRO", "RCFILE", "JSONFILE", "INPUTFORMAT", "OUTPUTFORMAT"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/hive/hive.formatter.js
var reservedSelect3 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses3 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "SORT BY",
  "CLUSTER BY",
  "DISTRIBUTE BY",
  "LIMIT",
  // Data manipulation
  // - insert:
  //   Hive does not actually support plain INSERT INTO, only INSERT INTO TABLE
  //   but it's a nuisance to not support it, as all other dialects do.
  "INSERT INTO [TABLE]",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE INTO",
  "WHEN [NOT] MATCHED [THEN]",
  "UPDATE SET",
  "INSERT [VALUES]",
  // - insert overwrite directory:
  //   https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DML#LanguageManualDML-Writingdataintothefilesystemfromqueries
  "INSERT OVERWRITE [LOCAL] DIRECTORY",
  // - load:
  //   https://cwiki.apache.org/confluence/display/Hive/LanguageManual+DML#LanguageManualDML-Loadingfilesintotables
  "LOAD DATA [LOCAL] INPATH",
  "[OVERWRITE] INTO TABLE",
  // Data definition
  "CREATE [MATERIALIZED] VIEW [IF NOT EXISTS]",
  "CREATE [TEMPORARY] [EXTERNAL] TABLE [IF NOT EXISTS]"
]);
var onelineClauses3 = expandPhrases([
  // - update:
  "UPDATE",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "RENAME TO",
  // - truncate:
  "TRUNCATE [TABLE]",
  // other
  "ALTER",
  "CREATE",
  "USE",
  "DESCRIBE",
  "DROP",
  "FETCH",
  "SHOW",
  "STORED AS",
  "STORED BY",
  "ROW FORMAT"
]);
var reservedSetOperations3 = expandPhrases(["UNION [ALL | DISTINCT]"]);
var reservedJoins3 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  // non-standard joins
  "LEFT SEMI JOIN"
]);
var reservedPhrases3 = expandPhrases(["{ROWS | RANGE} BETWEEN"]);
var hive = {
  tokenizerOptions: {
    reservedSelect: reservedSelect3,
    reservedClauses: [...reservedClauses3, ...onelineClauses3],
    reservedSetOperations: reservedSetOperations3,
    reservedJoins: reservedJoins3,
    reservedPhrases: reservedPhrases3,
    reservedKeywords: keywords3,
    reservedFunctionNames: functions3,
    extraParens: ["[]"],
    stringTypes: ['""-bs', "''-bs"],
    identTypes: ["``"],
    variableTypes: [{
      quote: "{}",
      prefixes: ["$"],
      requirePrefix: true
    }],
    operators: ["%", "~", "^", "|", "&", "<=>", "==", "!", "||"]
  },
  formatOptions: {
    onelineClauses: onelineClauses3
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/mariadb/mariadb.keywords.js
var keywords4 = flatKeywordList({
  // https://mariadb.com/kb/en/information-schema-keywords-table/
  all: [
    "ACCESSIBLE",
    "ACCOUNT",
    "ACTION",
    "ADD",
    "ADMIN",
    "AFTER",
    "AGAINST",
    "AGGREGATE",
    "ALL",
    "ALGORITHM",
    "ALTER",
    "ALWAYS",
    "ANALYZE",
    "AND",
    "ANY",
    "AS",
    "ASC",
    "ASCII",
    "ASENSITIVE",
    "AT",
    "ATOMIC",
    "AUTHORS",
    "AUTO_INCREMENT",
    "AUTOEXTEND_SIZE",
    "AUTO",
    "AVG",
    "AVG_ROW_LENGTH",
    "BACKUP",
    "BEFORE",
    "BEGIN",
    "BETWEEN",
    "BIGINT",
    "BINARY",
    "BINLOG",
    "BIT",
    "BLOB",
    "BLOCK",
    "BODY",
    "BOOL",
    "BOOLEAN",
    "BOTH",
    "BTREE",
    "BY",
    "BYTE",
    "CACHE",
    "CALL",
    "CASCADE",
    "CASCADED",
    "CASE",
    "CATALOG_NAME",
    "CHAIN",
    "CHANGE",
    "CHANGED",
    "CHAR",
    "CHARACTER",
    "CHARSET",
    "CHECK",
    "CHECKPOINT",
    "CHECKSUM",
    "CIPHER",
    "CLASS_ORIGIN",
    "CLIENT",
    "CLOB",
    "CLOSE",
    "COALESCE",
    "CODE",
    "COLLATE",
    "COLLATION",
    "COLUMN",
    "COLUMN_NAME",
    "COLUMNS",
    "COLUMN_ADD",
    "COLUMN_CHECK",
    "COLUMN_CREATE",
    "COLUMN_DELETE",
    "COLUMN_GET",
    "COMMENT",
    "COMMIT",
    "COMMITTED",
    "COMPACT",
    "COMPLETION",
    "COMPRESSED",
    "CONCURRENT",
    "CONDITION",
    "CONNECTION",
    "CONSISTENT",
    "CONSTRAINT",
    "CONSTRAINT_CATALOG",
    "CONSTRAINT_NAME",
    "CONSTRAINT_SCHEMA",
    "CONTAINS",
    "CONTEXT",
    "CONTINUE",
    "CONTRIBUTORS",
    "CONVERT",
    "CPU",
    "CREATE",
    "CROSS",
    "CUBE",
    "CURRENT",
    "CURRENT_DATE",
    "CURRENT_POS",
    "CURRENT_ROLE",
    "CURRENT_TIME",
    "CURRENT_TIMESTAMP",
    "CURRENT_USER",
    "CURSOR",
    "CURSOR_NAME",
    "CYCLE",
    "DATA",
    "DATABASE",
    "DATABASES",
    "DATAFILE",
    "DATE",
    "DATETIME",
    "DAY",
    "DAY_HOUR",
    "DAY_MICROSECOND",
    "DAY_MINUTE",
    "DAY_SECOND",
    "DEALLOCATE",
    "DEC",
    "DECIMAL",
    "DECLARE",
    "DEFAULT",
    "DEFINER",
    "DELAYED",
    "DELAY_KEY_WRITE",
    "DELETE",
    "DELETE_DOMAIN_ID",
    "DESC",
    "DESCRIBE",
    "DES_KEY_FILE",
    "DETERMINISTIC",
    "DIAGNOSTICS",
    "DIRECTORY",
    "DISABLE",
    "DISCARD",
    "DISK",
    "DISTINCT",
    "DISTINCTROW",
    "DIV",
    "DO",
    "DOUBLE",
    "DO_DOMAIN_IDS",
    "DROP",
    "DUAL",
    "DUMPFILE",
    "DUPLICATE",
    "DYNAMIC",
    "EACH",
    "ELSE",
    "ELSEIF",
    "ELSIF",
    "EMPTY",
    "ENABLE",
    "ENCLOSED",
    "END",
    "ENDS",
    "ENGINE",
    "ENGINES",
    "ENUM",
    "ERROR",
    "ERRORS",
    "ESCAPE",
    "ESCAPED",
    "EVENT",
    "EVENTS",
    "EVERY",
    "EXAMINED",
    "EXCEPT",
    "EXCHANGE",
    "EXCLUDE",
    "EXECUTE",
    "EXCEPTION",
    "EXISTS",
    "EXIT",
    "EXPANSION",
    "EXPIRE",
    "EXPORT",
    "EXPLAIN",
    "EXTENDED",
    "EXTENT_SIZE",
    "FALSE",
    "FAST",
    "FAULTS",
    "FEDERATED",
    "FETCH",
    "FIELDS",
    "FILE",
    "FIRST",
    "FIXED",
    "FLOAT",
    "FLOAT4",
    "FLOAT8",
    "FLUSH",
    "FOLLOWING",
    "FOLLOWS",
    "FOR",
    "FORCE",
    "FOREIGN",
    "FORMAT",
    "FOUND",
    "FROM",
    "FULL",
    "FULLTEXT",
    "FUNCTION",
    "GENERAL",
    "GENERATED",
    "GET_FORMAT",
    "GET",
    "GLOBAL",
    "GOTO",
    "GRANT",
    "GRANTS",
    "GROUP",
    "HANDLER",
    "HARD",
    "HASH",
    "HAVING",
    "HELP",
    "HIGH_PRIORITY",
    "HISTORY",
    "HOST",
    "HOSTS",
    "HOUR",
    "HOUR_MICROSECOND",
    "HOUR_MINUTE",
    "HOUR_SECOND",
    // 'ID', // conflicts with common column name
    "IDENTIFIED",
    "IF",
    "IGNORE",
    "IGNORED",
    "IGNORE_DOMAIN_IDS",
    "IGNORE_SERVER_IDS",
    "IMMEDIATE",
    "IMPORT",
    "INTERSECT",
    "IN",
    "INCREMENT",
    "INDEX",
    "INDEXES",
    "INFILE",
    "INITIAL_SIZE",
    "INNER",
    "INOUT",
    "INSENSITIVE",
    "INSERT",
    "INSERT_METHOD",
    "INSTALL",
    "INT",
    "INT1",
    "INT2",
    "INT3",
    "INT4",
    "INT8",
    "INTEGER",
    "INTERVAL",
    "INVISIBLE",
    "INTO",
    "IO",
    "IO_THREAD",
    "IPC",
    "IS",
    "ISOLATION",
    "ISOPEN",
    "ISSUER",
    "ITERATE",
    "INVOKER",
    "JOIN",
    "JSON",
    "JSON_TABLE",
    "KEY",
    "KEYS",
    "KEY_BLOCK_SIZE",
    "KILL",
    "LANGUAGE",
    "LAST",
    "LAST_VALUE",
    "LASTVAL",
    "LEADING",
    "LEAVE",
    "LEAVES",
    "LEFT",
    "LESS",
    "LEVEL",
    "LIKE",
    "LIMIT",
    "LINEAR",
    "LINES",
    "LIST",
    "LOAD",
    "LOCAL",
    "LOCALTIME",
    "LOCALTIMESTAMP",
    "LOCK",
    "LOCKED",
    "LOCKS",
    "LOGFILE",
    "LOGS",
    "LONG",
    "LONGBLOB",
    "LONGTEXT",
    "LOOP",
    "LOW_PRIORITY",
    "MASTER",
    "MASTER_CONNECT_RETRY",
    "MASTER_DELAY",
    "MASTER_GTID_POS",
    "MASTER_HOST",
    "MASTER_LOG_FILE",
    "MASTER_LOG_POS",
    "MASTER_PASSWORD",
    "MASTER_PORT",
    "MASTER_SERVER_ID",
    "MASTER_SSL",
    "MASTER_SSL_CA",
    "MASTER_SSL_CAPATH",
    "MASTER_SSL_CERT",
    "MASTER_SSL_CIPHER",
    "MASTER_SSL_CRL",
    "MASTER_SSL_CRLPATH",
    "MASTER_SSL_KEY",
    "MASTER_SSL_VERIFY_SERVER_CERT",
    "MASTER_USER",
    "MASTER_USE_GTID",
    "MASTER_HEARTBEAT_PERIOD",
    "MATCH",
    "MAX_CONNECTIONS_PER_HOUR",
    "MAX_QUERIES_PER_HOUR",
    "MAX_ROWS",
    "MAX_SIZE",
    "MAX_STATEMENT_TIME",
    "MAX_UPDATES_PER_HOUR",
    "MAX_USER_CONNECTIONS",
    "MAXVALUE",
    "MEDIUM",
    "MEDIUMBLOB",
    "MEDIUMINT",
    "MEDIUMTEXT",
    "MEMORY",
    "MERGE",
    "MESSAGE_TEXT",
    "MICROSECOND",
    "MIDDLEINT",
    "MIGRATE",
    "MINUS",
    "MINUTE",
    "MINUTE_MICROSECOND",
    "MINUTE_SECOND",
    "MINVALUE",
    "MIN_ROWS",
    "MOD",
    "MODE",
    "MODIFIES",
    "MODIFY",
    "MONITOR",
    "MONTH",
    "MUTEX",
    "MYSQL",
    "MYSQL_ERRNO",
    "NAME",
    "NAMES",
    "NATIONAL",
    "NATURAL",
    "NCHAR",
    "NESTED",
    "NEVER",
    "NEW",
    "NEXT",
    "NEXTVAL",
    "NO",
    "NOMAXVALUE",
    "NOMINVALUE",
    "NOCACHE",
    "NOCYCLE",
    "NO_WAIT",
    "NOWAIT",
    "NODEGROUP",
    "NONE",
    "NOT",
    "NOTFOUND",
    "NO_WRITE_TO_BINLOG",
    "NULL",
    "NUMBER",
    "NUMERIC",
    "NVARCHAR",
    "OF",
    "OFFSET",
    "OLD_PASSWORD",
    "ON",
    "ONE",
    "ONLINE",
    "ONLY",
    "OPEN",
    "OPTIMIZE",
    "OPTIONS",
    "OPTION",
    "OPTIONALLY",
    "OR",
    "ORDER",
    "ORDINALITY",
    "OTHERS",
    "OUT",
    "OUTER",
    "OUTFILE",
    "OVER",
    "OVERLAPS",
    "OWNER",
    "PACKAGE",
    "PACK_KEYS",
    "PAGE",
    "PAGE_CHECKSUM",
    "PARSER",
    "PARSE_VCOL_EXPR",
    "PATH",
    "PERIOD",
    "PARTIAL",
    "PARTITION",
    "PARTITIONING",
    "PARTITIONS",
    "PASSWORD",
    "PERSISTENT",
    "PHASE",
    "PLUGIN",
    "PLUGINS",
    "PORT",
    "PORTION",
    "PRECEDES",
    "PRECEDING",
    "PRECISION",
    "PREPARE",
    "PRESERVE",
    "PREV",
    "PREVIOUS",
    "PRIMARY",
    "PRIVILEGES",
    "PROCEDURE",
    "PROCESS",
    "PROCESSLIST",
    "PROFILE",
    "PROFILES",
    "PROXY",
    "PURGE",
    "QUARTER",
    "QUERY",
    "QUICK",
    "RAISE",
    "RANGE",
    "RAW",
    "READ",
    "READ_ONLY",
    "READ_WRITE",
    "READS",
    "REAL",
    "REBUILD",
    "RECOVER",
    "RECURSIVE",
    "REDO_BUFFER_SIZE",
    "REDOFILE",
    "REDUNDANT",
    "REFERENCES",
    "REGEXP",
    "RELAY",
    "RELAYLOG",
    "RELAY_LOG_FILE",
    "RELAY_LOG_POS",
    "RELAY_THREAD",
    "RELEASE",
    "RELOAD",
    "REMOVE",
    "RENAME",
    "REORGANIZE",
    "REPAIR",
    "REPEATABLE",
    "REPLACE",
    "REPLAY",
    "REPLICA",
    "REPLICAS",
    "REPLICA_POS",
    "REPLICATION",
    "REPEAT",
    "REQUIRE",
    "RESET",
    "RESIGNAL",
    "RESTART",
    "RESTORE",
    "RESTRICT",
    "RESUME",
    "RETURNED_SQLSTATE",
    "RETURN",
    "RETURNING",
    "RETURNS",
    "REUSE",
    "REVERSE",
    "REVOKE",
    "RIGHT",
    "RLIKE",
    "ROLE",
    "ROLLBACK",
    "ROLLUP",
    "ROUTINE",
    "ROW",
    "ROWCOUNT",
    "ROWNUM",
    "ROWS",
    "ROWTYPE",
    "ROW_COUNT",
    "ROW_FORMAT",
    "RTREE",
    "SAVEPOINT",
    "SCHEDULE",
    "SCHEMA",
    "SCHEMA_NAME",
    "SCHEMAS",
    "SECOND",
    "SECOND_MICROSECOND",
    "SECURITY",
    "SELECT",
    "SENSITIVE",
    "SEPARATOR",
    "SEQUENCE",
    "SERIAL",
    "SERIALIZABLE",
    "SESSION",
    "SERVER",
    "SET",
    "SETVAL",
    "SHARE",
    "SHOW",
    "SHUTDOWN",
    "SIGNAL",
    "SIGNED",
    "SIMPLE",
    "SKIP",
    "SLAVE",
    "SLAVES",
    "SLAVE_POS",
    "SLOW",
    "SNAPSHOT",
    "SMALLINT",
    "SOCKET",
    "SOFT",
    "SOME",
    "SONAME",
    "SOUNDS",
    "SOURCE",
    "STAGE",
    "STORED",
    "SPATIAL",
    "SPECIFIC",
    "REF_SYSTEM_ID",
    "SQL",
    "SQLEXCEPTION",
    "SQLSTATE",
    "SQLWARNING",
    "SQL_BIG_RESULT",
    "SQL_BUFFER_RESULT",
    "SQL_CACHE",
    "SQL_CALC_FOUND_ROWS",
    "SQL_NO_CACHE",
    "SQL_SMALL_RESULT",
    "SQL_THREAD",
    "SQL_TSI_SECOND",
    "SQL_TSI_MINUTE",
    "SQL_TSI_HOUR",
    "SQL_TSI_DAY",
    "SQL_TSI_WEEK",
    "SQL_TSI_MONTH",
    "SQL_TSI_QUARTER",
    "SQL_TSI_YEAR",
    "SSL",
    "START",
    "STARTING",
    "STARTS",
    "STATEMENT",
    "STATS_AUTO_RECALC",
    "STATS_PERSISTENT",
    "STATS_SAMPLE_PAGES",
    "STATUS",
    "STOP",
    "STORAGE",
    "STRAIGHT_JOIN",
    "STRING",
    "SUBCLASS_ORIGIN",
    "SUBJECT",
    "SUBPARTITION",
    "SUBPARTITIONS",
    "SUPER",
    "SUSPEND",
    "SWAPS",
    "SWITCHES",
    "SYSDATE",
    "SYSTEM",
    "SYSTEM_TIME",
    "TABLE",
    "TABLE_NAME",
    "TABLES",
    "TABLESPACE",
    "TABLE_CHECKSUM",
    "TEMPORARY",
    "TEMPTABLE",
    "TERMINATED",
    "TEXT",
    "THAN",
    "THEN",
    "TIES",
    "TIME",
    "TIMESTAMP",
    "TIMESTAMPADD",
    "TIMESTAMPDIFF",
    "TINYBLOB",
    "TINYINT",
    "TINYTEXT",
    "TO",
    "TRAILING",
    "TRANSACTION",
    "TRANSACTIONAL",
    "THREADS",
    "TRIGGER",
    "TRIGGERS",
    "TRUE",
    "TRUNCATE",
    "TYPE",
    "TYPES",
    "UNBOUNDED",
    "UNCOMMITTED",
    "UNDEFINED",
    "UNDO_BUFFER_SIZE",
    "UNDOFILE",
    "UNDO",
    "UNICODE",
    "UNION",
    "UNIQUE",
    "UNKNOWN",
    "UNLOCK",
    "UNINSTALL",
    "UNSIGNED",
    "UNTIL",
    "UPDATE",
    "UPGRADE",
    "USAGE",
    "USE",
    "USER",
    "USER_RESOURCES",
    "USE_FRM",
    "USING",
    "UTC_DATE",
    "UTC_TIME",
    "UTC_TIMESTAMP",
    "VALUE",
    "VALUES",
    "VARBINARY",
    "VARCHAR",
    "VARCHARACTER",
    "VARCHAR2",
    "VARIABLES",
    "VARYING",
    "VIA",
    "VIEW",
    "VIRTUAL",
    "VISIBLE",
    "VERSIONING",
    "WAIT",
    "WARNINGS",
    "WEEK",
    "WEIGHT_STRING",
    "WHEN",
    "WHERE",
    "WHILE",
    "WINDOW",
    "WITH",
    "WITHIN",
    "WITHOUT",
    "WORK",
    "WRAPPER",
    "WRITE",
    "X509",
    "XOR",
    "XA",
    "XML",
    "YEAR",
    "YEAR_MONTH",
    "ZEROFILL"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/mariadb/mariadb.functions.js
var functions4 = flatKeywordList({
  // https://mariadb.com/kb/en/information-schema-sql_functions-table/
  all: [
    "ADDDATE",
    "ADD_MONTHS",
    "BIT_AND",
    "BIT_OR",
    "BIT_XOR",
    "CAST",
    "COUNT",
    "CUME_DIST",
    "CURDATE",
    "CURTIME",
    "DATE_ADD",
    "DATE_SUB",
    "DATE_FORMAT",
    "DECODE",
    "DENSE_RANK",
    "EXTRACT",
    "FIRST_VALUE",
    "GROUP_CONCAT",
    "JSON_ARRAYAGG",
    "JSON_OBJECTAGG",
    "LAG",
    "LEAD",
    "MAX",
    "MEDIAN",
    "MID",
    "MIN",
    "NOW",
    "NTH_VALUE",
    "NTILE",
    "POSITION",
    "PERCENT_RANK",
    "PERCENTILE_CONT",
    "PERCENTILE_DISC",
    "RANK",
    "ROW_NUMBER",
    "SESSION_USER",
    "STD",
    "STDDEV",
    "STDDEV_POP",
    "STDDEV_SAMP",
    "SUBDATE",
    "SUBSTR",
    "SUBSTRING",
    "SUM",
    "SYSTEM_USER",
    "TRIM",
    "TRIM_ORACLE",
    "VARIANCE",
    "VAR_POP",
    "VAR_SAMP",
    "ABS",
    "ACOS",
    "ADDTIME",
    "AES_DECRYPT",
    "AES_ENCRYPT",
    "ASIN",
    "ATAN",
    "ATAN2",
    "BENCHMARK",
    "BIN",
    "BINLOG_GTID_POS",
    "BIT_COUNT",
    "BIT_LENGTH",
    "CEIL",
    "CEILING",
    "CHARACTER_LENGTH",
    "CHAR_LENGTH",
    "CHR",
    "COERCIBILITY",
    "COLUMN_CHECK",
    "COLUMN_EXISTS",
    "COLUMN_LIST",
    "COLUMN_JSON",
    "COMPRESS",
    "CONCAT",
    "CONCAT_OPERATOR_ORACLE",
    "CONCAT_WS",
    "CONNECTION_ID",
    "CONV",
    "CONVERT_TZ",
    "COS",
    "COT",
    "CRC32",
    "DATEDIFF",
    "DAYNAME",
    "DAYOFMONTH",
    "DAYOFWEEK",
    "DAYOFYEAR",
    "DEGREES",
    "DECODE_HISTOGRAM",
    "DECODE_ORACLE",
    "DES_DECRYPT",
    "DES_ENCRYPT",
    "ELT",
    "ENCODE",
    "ENCRYPT",
    "EXP",
    "EXPORT_SET",
    "EXTRACTVALUE",
    "FIELD",
    "FIND_IN_SET",
    "FLOOR",
    "FORMAT",
    "FOUND_ROWS",
    "FROM_BASE64",
    "FROM_DAYS",
    "FROM_UNIXTIME",
    "GET_LOCK",
    "GREATEST",
    "HEX",
    "IFNULL",
    "INSTR",
    "ISNULL",
    "IS_FREE_LOCK",
    "IS_USED_LOCK",
    "JSON_ARRAY",
    "JSON_ARRAY_APPEND",
    "JSON_ARRAY_INSERT",
    "JSON_COMPACT",
    "JSON_CONTAINS",
    "JSON_CONTAINS_PATH",
    "JSON_DEPTH",
    "JSON_DETAILED",
    "JSON_EXISTS",
    "JSON_EXTRACT",
    "JSON_INSERT",
    "JSON_KEYS",
    "JSON_LENGTH",
    "JSON_LOOSE",
    "JSON_MERGE",
    "JSON_MERGE_PATCH",
    "JSON_MERGE_PRESERVE",
    "JSON_QUERY",
    "JSON_QUOTE",
    "JSON_OBJECT",
    "JSON_REMOVE",
    "JSON_REPLACE",
    "JSON_SET",
    "JSON_SEARCH",
    "JSON_TYPE",
    "JSON_UNQUOTE",
    "JSON_VALID",
    "JSON_VALUE",
    "LAST_DAY",
    "LAST_INSERT_ID",
    "LCASE",
    "LEAST",
    "LENGTH",
    "LENGTHB",
    "LN",
    "LOAD_FILE",
    "LOCATE",
    "LOG",
    "LOG10",
    "LOG2",
    "LOWER",
    "LPAD",
    "LPAD_ORACLE",
    "LTRIM",
    "LTRIM_ORACLE",
    "MAKEDATE",
    "MAKETIME",
    "MAKE_SET",
    "MASTER_GTID_WAIT",
    "MASTER_POS_WAIT",
    "MD5",
    "MONTHNAME",
    "NAME_CONST",
    "NVL",
    "NVL2",
    "OCT",
    "OCTET_LENGTH",
    "ORD",
    "PERIOD_ADD",
    "PERIOD_DIFF",
    "PI",
    "POW",
    "POWER",
    "QUOTE",
    "REGEXP_INSTR",
    "REGEXP_REPLACE",
    "REGEXP_SUBSTR",
    "RADIANS",
    "RAND",
    "RELEASE_ALL_LOCKS",
    "RELEASE_LOCK",
    "REPLACE_ORACLE",
    "REVERSE",
    "ROUND",
    "RPAD",
    "RPAD_ORACLE",
    "RTRIM",
    "RTRIM_ORACLE",
    "SEC_TO_TIME",
    "SHA",
    "SHA1",
    "SHA2",
    "SIGN",
    "SIN",
    "SLEEP",
    "SOUNDEX",
    "SPACE",
    "SQRT",
    "STRCMP",
    "STR_TO_DATE",
    "SUBSTR_ORACLE",
    "SUBSTRING_INDEX",
    "SUBTIME",
    "SYS_GUID",
    "TAN",
    "TIMEDIFF",
    "TIME_FORMAT",
    "TIME_TO_SEC",
    "TO_BASE64",
    "TO_CHAR",
    "TO_DAYS",
    "TO_SECONDS",
    "UCASE",
    "UNCOMPRESS",
    "UNCOMPRESSED_LENGTH",
    "UNHEX",
    "UNIX_TIMESTAMP",
    "UPDATEXML",
    "UPPER",
    "UUID",
    "UUID_SHORT",
    "VERSION",
    "WEEKDAY",
    "WEEKOFYEAR",
    "WSREP_LAST_WRITTEN_GTID",
    "WSREP_LAST_SEEN_GTID",
    "WSREP_SYNC_WAIT_UPTO_GTID",
    "YEARWEEK",
    // CASE expression shorthands
    "COALESCE",
    "NULLIF",
    // Data types with parameters
    // https://mariadb.com/kb/en/data-types/
    "TINYINT",
    "SMALLINT",
    "MEDIUMINT",
    "INT",
    "INTEGER",
    "BIGINT",
    "DECIMAL",
    "DEC",
    "NUMERIC",
    "FIXED",
    // 'NUMBER', // ?? In oracle mode only
    "FLOAT",
    "DOUBLE",
    "DOUBLE PRECISION",
    "REAL",
    "BIT",
    "BINARY",
    "BLOB",
    "CHAR",
    "NATIONAL CHAR",
    "CHAR BYTE",
    "ENUM",
    "VARBINARY",
    "VARCHAR",
    "NATIONAL VARCHAR",
    // 'SET' // handled as special-case in postProcess
    "TIME",
    "DATETIME",
    "TIMESTAMP",
    "YEAR"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/mariadb/mariadb.formatter.js
var reservedSelect4 = expandPhrases(["SELECT [ALL | DISTINCT | DISTINCTROW]"]);
var reservedClauses4 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  // Data manipulation
  // - insert:
  "INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE] [INTO]",
  "REPLACE [LOW_PRIORITY | DELAYED] [INTO]",
  "VALUES",
  // - update:
  "SET",
  // Data definition
  "CREATE [OR REPLACE] [SQL SECURITY DEFINER | SQL SECURITY INVOKER] VIEW [IF NOT EXISTS]",
  "CREATE [OR REPLACE] [TEMPORARY] TABLE [IF NOT EXISTS]",
  // other
  "RETURNING"
]);
var onelineClauses4 = expandPhrases([
  // - update:
  "UPDATE [LOW_PRIORITY] [IGNORE]",
  // - delete:
  "DELETE [LOW_PRIORITY] [QUICK] [IGNORE] FROM",
  // - drop table:
  "DROP [TEMPORARY] TABLE [IF EXISTS]",
  // - alter table:
  "ALTER [ONLINE] [IGNORE] TABLE [IF EXISTS]",
  "ADD [COLUMN] [IF NOT EXISTS]",
  "{CHANGE | MODIFY} [COLUMN] [IF EXISTS]",
  "DROP [COLUMN] [IF EXISTS]",
  "RENAME [TO]",
  "RENAME COLUMN",
  "ALTER [COLUMN]",
  "{SET | DROP} DEFAULT",
  // for alter column
  "SET {VISIBLE | INVISIBLE}",
  // for alter column
  // - truncate:
  "TRUNCATE [TABLE]",
  // https://mariadb.com/docs/reference/mdb/sql-statements/
  "ALTER DATABASE",
  "ALTER DATABASE COMMENT",
  "ALTER EVENT",
  "ALTER FUNCTION",
  "ALTER PROCEDURE",
  "ALTER SCHEMA",
  "ALTER SCHEMA COMMENT",
  "ALTER SEQUENCE",
  "ALTER SERVER",
  "ALTER USER",
  "ALTER VIEW",
  "ANALYZE",
  "ANALYZE TABLE",
  "BACKUP LOCK",
  "BACKUP STAGE",
  "BACKUP UNLOCK",
  "BEGIN",
  "BINLOG",
  "CACHE INDEX",
  "CALL",
  "CHANGE MASTER TO",
  "CHECK TABLE",
  "CHECK VIEW",
  "CHECKSUM TABLE",
  "COMMIT",
  "CREATE AGGREGATE FUNCTION",
  "CREATE DATABASE",
  "CREATE EVENT",
  "CREATE FUNCTION",
  "CREATE INDEX",
  "CREATE PROCEDURE",
  "CREATE ROLE",
  "CREATE SEQUENCE",
  "CREATE SERVER",
  "CREATE SPATIAL INDEX",
  "CREATE TRIGGER",
  "CREATE UNIQUE INDEX",
  "CREATE USER",
  "DEALLOCATE PREPARE",
  "DESCRIBE",
  "DROP DATABASE",
  "DROP EVENT",
  "DROP FUNCTION",
  "DROP INDEX",
  "DROP PREPARE",
  "DROP PROCEDURE",
  "DROP ROLE",
  "DROP SEQUENCE",
  "DROP SERVER",
  "DROP TRIGGER",
  "DROP USER",
  "DROP VIEW",
  "EXECUTE",
  "EXPLAIN",
  "FLUSH",
  "GET DIAGNOSTICS",
  "GET DIAGNOSTICS CONDITION",
  "GRANT",
  "HANDLER",
  "HELP",
  "INSTALL PLUGIN",
  "INSTALL SONAME",
  "KILL",
  "LOAD DATA INFILE",
  "LOAD INDEX INTO CACHE",
  "LOAD XML INFILE",
  "LOCK TABLE",
  "OPTIMIZE TABLE",
  "PREPARE",
  "PURGE BINARY LOGS",
  "PURGE MASTER LOGS",
  "RELEASE SAVEPOINT",
  "RENAME TABLE",
  "RENAME USER",
  "REPAIR TABLE",
  "REPAIR VIEW",
  "RESET MASTER",
  "RESET QUERY CACHE",
  "RESET REPLICA",
  "RESET SLAVE",
  "RESIGNAL",
  "REVOKE",
  "ROLLBACK",
  "SAVEPOINT",
  "SET CHARACTER SET",
  "SET DEFAULT ROLE",
  "SET GLOBAL TRANSACTION",
  "SET NAMES",
  "SET PASSWORD",
  "SET ROLE",
  "SET STATEMENT",
  "SET TRANSACTION",
  "SHOW",
  "SHOW ALL REPLICAS STATUS",
  "SHOW ALL SLAVES STATUS",
  "SHOW AUTHORS",
  "SHOW BINARY LOGS",
  "SHOW BINLOG EVENTS",
  "SHOW BINLOG STATUS",
  "SHOW CHARACTER SET",
  "SHOW CLIENT_STATISTICS",
  "SHOW COLLATION",
  "SHOW COLUMNS",
  "SHOW CONTRIBUTORS",
  "SHOW CREATE DATABASE",
  "SHOW CREATE EVENT",
  "SHOW CREATE FUNCTION",
  "SHOW CREATE PACKAGE",
  "SHOW CREATE PACKAGE BODY",
  "SHOW CREATE PROCEDURE",
  "SHOW CREATE SEQUENCE",
  "SHOW CREATE TABLE",
  "SHOW CREATE TRIGGER",
  "SHOW CREATE USER",
  "SHOW CREATE VIEW",
  "SHOW DATABASES",
  "SHOW ENGINE",
  "SHOW ENGINE INNODB STATUS",
  "SHOW ENGINES",
  "SHOW ERRORS",
  "SHOW EVENTS",
  "SHOW EXPLAIN",
  "SHOW FUNCTION CODE",
  "SHOW FUNCTION STATUS",
  "SHOW GRANTS",
  "SHOW INDEX",
  "SHOW INDEXES",
  "SHOW INDEX_STATISTICS",
  "SHOW KEYS",
  "SHOW LOCALES",
  "SHOW MASTER LOGS",
  "SHOW MASTER STATUS",
  "SHOW OPEN TABLES",
  "SHOW PACKAGE BODY CODE",
  "SHOW PACKAGE BODY STATUS",
  "SHOW PACKAGE STATUS",
  "SHOW PLUGINS",
  "SHOW PLUGINS SONAME",
  "SHOW PRIVILEGES",
  "SHOW PROCEDURE CODE",
  "SHOW PROCEDURE STATUS",
  "SHOW PROCESSLIST",
  "SHOW PROFILE",
  "SHOW PROFILES",
  "SHOW QUERY_RESPONSE_TIME",
  "SHOW RELAYLOG EVENTS",
  "SHOW REPLICA",
  "SHOW REPLICA HOSTS",
  "SHOW REPLICA STATUS",
  "SHOW SCHEMAS",
  "SHOW SLAVE",
  "SHOW SLAVE HOSTS",
  "SHOW SLAVE STATUS",
  "SHOW STATUS",
  "SHOW STORAGE ENGINES",
  "SHOW TABLE STATUS",
  "SHOW TABLES",
  "SHOW TRIGGERS",
  "SHOW USER_STATISTICS",
  "SHOW VARIABLES",
  "SHOW WARNINGS",
  "SHOW WSREP_MEMBERSHIP",
  "SHOW WSREP_STATUS",
  "SHUTDOWN",
  "SIGNAL",
  "START ALL REPLICAS",
  "START ALL SLAVES",
  "START REPLICA",
  "START SLAVE",
  "START TRANSACTION",
  "STOP ALL REPLICAS",
  "STOP ALL SLAVES",
  "STOP REPLICA",
  "STOP SLAVE",
  "UNINSTALL PLUGIN",
  "UNINSTALL SONAME",
  "UNLOCK TABLE",
  "USE",
  "XA BEGIN",
  "XA COMMIT",
  "XA END",
  "XA PREPARE",
  "XA RECOVER",
  "XA ROLLBACK",
  "XA START"
]);
var reservedSetOperations4 = expandPhrases(["UNION [ALL | DISTINCT]", "EXCEPT [ALL | DISTINCT]", "INTERSECT [ALL | DISTINCT]", "MINUS [ALL | DISTINCT]"]);
var reservedJoins4 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL JOIN",
  "NATURAL {LEFT | RIGHT} [OUTER] JOIN",
  // non-standard joins
  "STRAIGHT_JOIN"
]);
var reservedPhrases4 = expandPhrases(["ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]", "CHARACTER SET", "{ROWS | RANGE} BETWEEN"]);
var mariadb = {
  tokenizerOptions: {
    reservedSelect: reservedSelect4,
    reservedClauses: [...reservedClauses4, ...onelineClauses4],
    reservedSetOperations: reservedSetOperations4,
    reservedJoins: reservedJoins4,
    reservedPhrases: reservedPhrases4,
    supportsXor: true,
    reservedKeywords: keywords4,
    reservedFunctionNames: functions4,
    // TODO: support _ char set prefixes such as _utf8, _latin1, _binary, _utf8mb4, etc.
    stringTypes: ['""-qq-bs', "''-qq-bs", {
      quote: "''-raw",
      prefixes: ["B", "X"],
      requirePrefix: true
    }],
    identTypes: ["``"],
    identChars: {
      first: "$",
      rest: "$",
      allowFirstCharNumber: true
    },
    variableTypes: [{
      regex: "@@?[A-Za-z0-9_.$]+"
    }, {
      quote: '""-qq-bs',
      prefixes: ["@"],
      requirePrefix: true
    }, {
      quote: "''-qq-bs",
      prefixes: ["@"],
      requirePrefix: true
    }, {
      quote: "``",
      prefixes: ["@"],
      requirePrefix: true
    }],
    paramTypes: {
      positional: true
    },
    lineCommentTypes: ["--", "#"],
    operators: ["%", ":=", "&", "|", "^", "~", "<<", ">>", "<=>", "&&", "||", "!"],
    postProcess: postProcess2
  },
  formatOptions: {
    onelineClauses: onelineClauses4
  }
};
function postProcess2(tokens) {
  return tokens.map((token, i) => {
    const nextToken = tokens[i + 1] || EOF_TOKEN;
    if (isToken.SET(token) && nextToken.text === "(") {
      return {
        ...token,
        type: TokenType.RESERVED_FUNCTION_NAME
      };
    }
    return token;
  });
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/mysql/mysql.keywords.js
var keywords5 = flatKeywordList({
  // https://dev.mysql.com/doc/refman/8.0/en/keywords.html
  all: [
    "ACCESSIBLE",
    // (R)
    "ACCOUNT",
    "ACTION",
    "ACTIVE",
    "ADD",
    // (R)
    "ADMIN",
    "AFTER",
    "AGAINST",
    "AGGREGATE",
    "ALGORITHM",
    "ALL",
    // (R)
    "ALTER",
    // (R)
    "ALWAYS",
    "ANALYZE",
    // (R)
    "AND",
    // (R)
    "ANY",
    "ARRAY",
    "AS",
    // (R)
    "ASC",
    // (R)
    "ASCII",
    "ASENSITIVE",
    // (R)
    "AT",
    "ATTRIBUTE",
    "AUTHENTICATION",
    "AUTOEXTEND_SIZE",
    "AUTO_INCREMENT",
    "AVG",
    "AVG_ROW_LENGTH",
    "BACKUP",
    "BEFORE",
    // (R)
    "BEGIN",
    "BETWEEN",
    // (R)
    "BIGINT",
    // (R)
    "BINARY",
    // (R)
    "BINLOG",
    "BIT",
    "BLOB",
    // (R)
    "BLOCK",
    "BOOL",
    "BOOLEAN",
    "BOTH",
    // (R)
    "BTREE",
    "BUCKETS",
    "BY",
    // (R)
    "BYTE",
    "CACHE",
    "CALL",
    // (R)
    "CASCADE",
    // (R)
    "CASCADED",
    "CASE",
    // (R)
    "CATALOG_NAME",
    "CHAIN",
    "CHALLENGE_RESPONSE",
    "CHANGE",
    // (R)
    "CHANGED",
    "CHANNEL",
    "CHAR",
    // (R)
    "CHARACTER",
    // (R)
    "CHARSET",
    "CHECK",
    // (R)
    "CHECKSUM",
    "CIPHER",
    "CLASS_ORIGIN",
    "CLIENT",
    "CLONE",
    "CLOSE",
    "COALESCE",
    "CODE",
    "COLLATE",
    // (R)
    "COLLATION",
    "COLUMN",
    // (R)
    "COLUMNS",
    "COLUMN_FORMAT",
    "COLUMN_NAME",
    "COMMENT",
    "COMMIT",
    "COMMITTED",
    "COMPACT",
    "COMPLETION",
    "COMPONENT",
    "COMPRESSED",
    "COMPRESSION",
    "CONCURRENT",
    "CONDITION",
    // (R)
    "CONNECTION",
    "CONSISTENT",
    "CONSTRAINT",
    // (R)
    "CONSTRAINT_CATALOG",
    "CONSTRAINT_NAME",
    "CONSTRAINT_SCHEMA",
    "CONTAINS",
    "CONTEXT",
    "CONTINUE",
    // (R)
    "CONVERT",
    // (R)
    "CPU",
    "CREATE",
    // (R)
    "CROSS",
    // (R)
    "CUBE",
    // (R)
    "CUME_DIST",
    // (R)
    "CURRENT",
    "CURRENT_DATE",
    // (R)
    "CURRENT_TIME",
    // (R)
    "CURRENT_TIMESTAMP",
    // (R)
    "CURRENT_USER",
    // (R)
    "CURSOR",
    // (R)
    "CURSOR_NAME",
    "DATA",
    "DATABASE",
    // (R)
    "DATABASES",
    // (R)
    "DATAFILE",
    "DATE",
    "DATETIME",
    "DAY",
    "DAY_HOUR",
    // (R)
    "DAY_MICROSECOND",
    // (R)
    "DAY_MINUTE",
    // (R)
    "DAY_SECOND",
    // (R)
    "DEALLOCATE",
    "DEC",
    // (R)
    "DECIMAL",
    // (R)
    "DECLARE",
    // (R)
    "DEFAULT",
    // (R)
    "DEFAULT_AUTH",
    "DEFINER",
    "DEFINITION",
    "DELAYED",
    // (R)
    "DELAY_KEY_WRITE",
    "DELETE",
    // (R)
    "DENSE_RANK",
    // (R)
    "DESC",
    // (R)
    "DESCRIBE",
    // (R)
    "DESCRIPTION",
    "DETERMINISTIC",
    // (R)
    "DIAGNOSTICS",
    "DIRECTORY",
    "DISABLE",
    "DISCARD",
    "DISK",
    "DISTINCT",
    // (R)
    "DISTINCTROW",
    // (R)
    "DIV",
    // (R)
    "DO",
    "DOUBLE",
    // (R)
    "DROP",
    // (R)
    "DUAL",
    // (R)
    "DUMPFILE",
    "DUPLICATE",
    "DYNAMIC",
    "EACH",
    // (R)
    "ELSE",
    // (R)
    "ELSEIF",
    // (R)
    "EMPTY",
    // (R)
    "ENABLE",
    "ENCLOSED",
    // (R)
    "ENCRYPTION",
    "END",
    "ENDS",
    "ENFORCED",
    "ENGINE",
    "ENGINES",
    "ENGINE_ATTRIBUTE",
    "ENUM",
    "ERROR",
    "ERRORS",
    "ESCAPE",
    "ESCAPED",
    // (R)
    "EVENT",
    "EVENTS",
    "EVERY",
    "EXCEPT",
    // (R)
    "EXCHANGE",
    "EXCLUDE",
    "EXECUTE",
    "EXISTS",
    // (R)
    "EXIT",
    // (R)
    "EXPANSION",
    "EXPIRE",
    "EXPLAIN",
    // (R)
    "EXPORT",
    "EXTENDED",
    "EXTENT_SIZE",
    "FACTOR",
    "FAILED_LOGIN_ATTEMPTS",
    "FALSE",
    // (R)
    "FAST",
    "FAULTS",
    "FETCH",
    // (R)
    "FIELDS",
    "FILE",
    "FILE_BLOCK_SIZE",
    "FILTER",
    "FINISH",
    "FIRST",
    "FIRST_VALUE",
    // (R)
    "FIXED",
    "FLOAT",
    // (R)
    "FLOAT4",
    // (R)
    "FLOAT8",
    // (R)
    "FLUSH",
    "FOLLOWING",
    "FOLLOWS",
    "FOR",
    // (R)
    "FORCE",
    // (R)
    "FOREIGN",
    // (R)
    "FORMAT",
    "FOUND",
    "FROM",
    // (R)
    "FULL",
    "FULLTEXT",
    // (R)
    "FUNCTION",
    // (R)
    "GENERAL",
    "GENERATED",
    // (R)
    "GEOMCOLLECTION",
    "GEOMETRY",
    "GEOMETRYCOLLECTION",
    "GET",
    // (R)
    "GET_FORMAT",
    "GET_MASTER_PUBLIC_KEY",
    "GET_SOURCE_PUBLIC_KEY",
    "GLOBAL",
    "GRANT",
    // (R)
    "GRANTS",
    "GROUP",
    // (R)
    "GROUPING",
    // (R)
    "GROUPS",
    // (R)
    "GROUP_REPLICATION",
    "GTID_ONLY",
    "HANDLER",
    "HASH",
    "HAVING",
    // (R)
    "HELP",
    "HIGH_PRIORITY",
    // (R)
    "HISTOGRAM",
    "HISTORY",
    "HOST",
    "HOSTS",
    "HOUR",
    "HOUR_MICROSECOND",
    // (R)
    "HOUR_MINUTE",
    // (R)
    "HOUR_SECOND",
    // (R)
    "IDENTIFIED",
    "IF",
    // (R)
    "IGNORE",
    // (R)
    "IGNORE_SERVER_IDS",
    "IMPORT",
    "IN",
    // (R)
    "INACTIVE",
    "INDEX",
    // (R)
    "INDEXES",
    "INFILE",
    // (R)
    "INITIAL",
    "INITIAL_SIZE",
    "INITIATE",
    "INNER",
    // (R)
    "INOUT",
    // (R)
    "INSENSITIVE",
    // (R)
    "INSERT",
    // (R)
    "INSERT_METHOD",
    "INSTALL",
    "INSTANCE",
    "IN",
    // <-- moved over from functions
    "INT",
    // (R)
    "INT1",
    // (R)
    "INT2",
    // (R)
    "INT3",
    // (R)
    "INT4",
    // (R)
    "INT8",
    // (R)
    "INTEGER",
    // (R)
    "INTERSECT",
    // (R)
    "INTERVAL",
    // (R)
    "INTO",
    // (R)
    "INVISIBLE",
    "INVOKER",
    "IO",
    "IO_AFTER_GTIDS",
    // (R)
    "IO_BEFORE_GTIDS",
    // (R)
    "IO_THREAD",
    "IPC",
    "IS",
    // (R)
    "ISOLATION",
    "ISSUER",
    "ITERATE",
    // (R)
    "JOIN",
    // (R)
    "JSON",
    "JSON_TABLE",
    // (R)
    "JSON_VALUE",
    "KEY",
    // (R)
    "KEYRING",
    "KEYS",
    // (R)
    "KEY_BLOCK_SIZE",
    "KILL",
    // (R)
    "LAG",
    // (R)
    "LANGUAGE",
    "LAST",
    "LAST_VALUE",
    // (R)
    "LATERAL",
    // (R)
    "LEAD",
    // (R)
    "LEADING",
    // (R)
    "LEAVE",
    // (R)
    "LEAVES",
    "LEFT",
    // (R)
    "LESS",
    "LEVEL",
    "LIKE",
    // (R)
    "LIMIT",
    // (R)
    "LINEAR",
    // (R)
    "LINES",
    // (R)
    "LINESTRING",
    "LIST",
    "LOAD",
    // (R)
    "LOCAL",
    "LOCALTIME",
    // (R)
    "LOCALTIMESTAMP",
    // (R)
    "LOCK",
    // (R)
    "LOCKED",
    "LOCKS",
    "LOGFILE",
    "LOGS",
    "LONG",
    // (R)
    "LONGBLOB",
    // (R)
    "LONGTEXT",
    // (R)
    "LOOP",
    // (R)
    "LOW_PRIORITY",
    // (R)
    "MASTER",
    "MASTER_AUTO_POSITION",
    "MASTER_BIND",
    // (R)
    "MASTER_COMPRESSION_ALGORITHMS",
    "MASTER_CONNECT_RETRY",
    "MASTER_DELAY",
    "MASTER_HEARTBEAT_PERIOD",
    "MASTER_HOST",
    "MASTER_LOG_FILE",
    "MASTER_LOG_POS",
    "MASTER_PASSWORD",
    "MASTER_PORT",
    "MASTER_PUBLIC_KEY_PATH",
    "MASTER_RETRY_COUNT",
    "MASTER_SSL",
    "MASTER_SSL_CA",
    "MASTER_SSL_CAPATH",
    "MASTER_SSL_CERT",
    "MASTER_SSL_CIPHER",
    "MASTER_SSL_CRL",
    "MASTER_SSL_CRLPATH",
    "MASTER_SSL_KEY",
    "MASTER_SSL_VERIFY_SERVER_CERT",
    // (R)
    "MASTER_TLS_CIPHERSUITES",
    "MASTER_TLS_VERSION",
    "MASTER_USER",
    "MASTER_ZSTD_COMPRESSION_LEVEL",
    "MATCH",
    // (R)
    "MAXVALUE",
    // (R)
    "MAX_CONNECTIONS_PER_HOUR",
    "MAX_QUERIES_PER_HOUR",
    "MAX_ROWS",
    "MAX_SIZE",
    "MAX_UPDATES_PER_HOUR",
    "MAX_USER_CONNECTIONS",
    "MEDIUM",
    "MEDIUMBLOB",
    // (R)
    "MEDIUMINT",
    // (R)
    "MEDIUMTEXT",
    // (R)
    "MEMBER",
    "MEMORY",
    "MERGE",
    "MESSAGE_TEXT",
    "MICROSECOND",
    "MIDDLEINT",
    // (R)
    "MIGRATE",
    "MINUTE",
    "MINUTE_MICROSECOND",
    // (R)
    "MINUTE_SECOND",
    // (R)
    "MIN_ROWS",
    "MOD",
    // (R)
    "MODE",
    "MODIFIES",
    // (R)
    "MODIFY",
    "MONTH",
    "MULTILINESTRING",
    "MULTIPOINT",
    "MULTIPOLYGON",
    "MUTEX",
    "MYSQL_ERRNO",
    "NAME",
    "NAMES",
    "NATIONAL",
    "NATURAL",
    // (R)
    "NCHAR",
    "NDB",
    "NDBCLUSTER",
    "NESTED",
    "NETWORK_NAMESPACE",
    "NEVER",
    "NEW",
    "NEXT",
    "NO",
    "NODEGROUP",
    "NONE",
    "NOT",
    // (R)
    "NOWAIT",
    "NO_WAIT",
    "NO_WRITE_TO_BINLOG",
    // (R)
    "NTH_VALUE",
    // (R)
    "NTILE",
    // (R)
    "NULL",
    // (R)
    "NULLS",
    "NUMBER",
    "NUMERIC",
    // (R)
    "NVARCHAR",
    "OF",
    // (R)
    "OFF",
    "OFFSET",
    "OJ",
    "OLD",
    "ON",
    // (R)
    "ONE",
    "ONLY",
    "OPEN",
    "OPTIMIZE",
    // (R)
    "OPTIMIZER_COSTS",
    // (R)
    "OPTION",
    // (R)
    "OPTIONAL",
    "OPTIONALLY",
    // (R)
    "OPTIONS",
    "OR",
    // (R)
    "ORDER",
    // (R)
    "ORDINALITY",
    "ORGANIZATION",
    "OTHERS",
    "OUT",
    // (R)
    "OUTER",
    // (R)
    "OUTFILE",
    // (R)
    "OVER",
    // (R)
    "OWNER",
    "PACK_KEYS",
    "PAGE",
    "PARSER",
    "PARTIAL",
    "PARTITION",
    // (R)
    "PARTITIONING",
    "PARTITIONS",
    "PASSWORD",
    "PASSWORD_LOCK_TIME",
    "PATH",
    "PERCENT_RANK",
    // (R)
    "PERSIST",
    "PERSIST_ONLY",
    "PHASE",
    "PLUGIN",
    "PLUGINS",
    "PLUGIN_DIR",
    "POINT",
    "POLYGON",
    "PORT",
    "PRECEDES",
    "PRECEDING",
    "PRECISION",
    // (R)
    "PREPARE",
    "PRESERVE",
    "PREV",
    "PRIMARY",
    // (R)
    "PRIVILEGES",
    "PRIVILEGE_CHECKS_USER",
    "PROCEDURE",
    // (R)
    "PROCESS",
    "PROCESSLIST",
    "PROFILE",
    "PROFILES",
    "PROXY",
    "PURGE",
    // (R)
    "QUARTER",
    "QUERY",
    "QUICK",
    "RANDOM",
    "RANGE",
    // (R)
    "RANK",
    // (R)
    "READ",
    // (R)
    "READS",
    // (R)
    "READ_ONLY",
    "READ_WRITE",
    // (R)
    "REAL",
    // (R)
    "REBUILD",
    "RECOVER",
    "RECURSIVE",
    // (R)
    "REDO_BUFFER_SIZE",
    "REDUNDANT",
    "REFERENCE",
    "REFERENCES",
    // (R)
    "REGEXP",
    // (R)
    "REGISTRATION",
    "RELAY",
    "RELAYLOG",
    "RELAY_LOG_FILE",
    "RELAY_LOG_POS",
    "RELAY_THREAD",
    "RELEASE",
    // (R)
    "RELOAD",
    "REMOVE",
    "RENAME",
    // (R)
    "REORGANIZE",
    "REPAIR",
    "REPEAT",
    // (R)
    "REPEATABLE",
    "REPLACE",
    // (R)
    "REPLICA",
    "REPLICAS",
    "REPLICATE_DO_DB",
    "REPLICATE_DO_TABLE",
    "REPLICATE_IGNORE_DB",
    "REPLICATE_IGNORE_TABLE",
    "REPLICATE_REWRITE_DB",
    "REPLICATE_WILD_DO_TABLE",
    "REPLICATE_WILD_IGNORE_TABLE",
    "REPLICATION",
    "REQUIRE",
    // (R)
    "REQUIRE_ROW_FORMAT",
    "RESET",
    "RESIGNAL",
    // (R)
    "RESOURCE",
    "RESPECT",
    "RESTART",
    "RESTORE",
    "RESTRICT",
    // (R)
    "RESUME",
    "RETAIN",
    "RETURN",
    // (R)
    "RETURNED_SQLSTATE",
    "RETURNING",
    "RETURNS",
    "REUSE",
    "REVERSE",
    "REVOKE",
    // (R)
    "RIGHT",
    // (R)
    "RLIKE",
    // (R)
    "ROLE",
    "ROLLBACK",
    "ROLLUP",
    "ROTATE",
    "ROUTINE",
    "ROW",
    // (R)
    "ROWS",
    // (R)
    "ROW_COUNT",
    "ROW_FORMAT",
    "ROW_NUMBER",
    // (R)
    "RTREE",
    "SAVEPOINT",
    "SCHEDULE",
    "SCHEMA",
    // (R)
    "SCHEMAS",
    // (R)
    "SCHEMA_NAME",
    "SECOND",
    "SECONDARY",
    "SECONDARY_ENGINE",
    "SECONDARY_ENGINE_ATTRIBUTE",
    "SECONDARY_LOAD",
    "SECONDARY_UNLOAD",
    "SECOND_MICROSECOND",
    // (R)
    "SECURITY",
    "SELECT",
    // (R)
    "SENSITIVE",
    // (R)
    "SEPARATOR",
    // (R)
    "SERIAL",
    "SERIALIZABLE",
    "SERVER",
    "SESSION",
    "SET",
    // (R)
    "SHARE",
    "SHOW",
    // (R)
    "SHUTDOWN",
    "SIGNAL",
    // (R)
    "SIGNED",
    "SIMPLE",
    "SKIP",
    "SLAVE",
    "SLOW",
    "SMALLINT",
    // (R)
    "SNAPSHOT",
    "SOCKET",
    "SOME",
    "SONAME",
    "SOUNDS",
    "SOURCE",
    "SOURCE_AUTO_POSITION",
    "SOURCE_BIND",
    "SOURCE_COMPRESSION_ALGORITHMS",
    "SOURCE_CONNECT_RETRY",
    "SOURCE_DELAY",
    "SOURCE_HEARTBEAT_PERIOD",
    "SOURCE_HOST",
    "SOURCE_LOG_FILE",
    "SOURCE_LOG_POS",
    "SOURCE_PASSWORD",
    "SOURCE_PORT",
    "SOURCE_PUBLIC_KEY_PATH",
    "SOURCE_RETRY_COUNT",
    "SOURCE_SSL",
    "SOURCE_SSL_CA",
    "SOURCE_SSL_CAPATH",
    "SOURCE_SSL_CERT",
    "SOURCE_SSL_CIPHER",
    "SOURCE_SSL_CRL",
    "SOURCE_SSL_CRLPATH",
    "SOURCE_SSL_KEY",
    "SOURCE_SSL_VERIFY_SERVER_CERT",
    "SOURCE_TLS_CIPHERSUITES",
    "SOURCE_TLS_VERSION",
    "SOURCE_USER",
    "SOURCE_ZSTD_COMPRESSION_LEVEL",
    "SPATIAL",
    // (R)
    "SPECIFIC",
    // (R)
    "SQL",
    // (R)
    "SQLEXCEPTION",
    // (R)
    "SQLSTATE",
    // (R)
    "SQLWARNING",
    // (R)
    "SQL_AFTER_GTIDS",
    "SQL_AFTER_MTS_GAPS",
    "SQL_BEFORE_GTIDS",
    "SQL_BIG_RESULT",
    // (R)
    "SQL_BUFFER_RESULT",
    "SQL_CALC_FOUND_ROWS",
    // (R)
    "SQL_NO_CACHE",
    "SQL_SMALL_RESULT",
    // (R)
    "SQL_THREAD",
    "SQL_TSI_DAY",
    "SQL_TSI_HOUR",
    "SQL_TSI_MINUTE",
    "SQL_TSI_MONTH",
    "SQL_TSI_QUARTER",
    "SQL_TSI_SECOND",
    "SQL_TSI_WEEK",
    "SQL_TSI_YEAR",
    "SRID",
    "SSL",
    // (R)
    "STACKED",
    "START",
    "STARTING",
    // (R)
    "STARTS",
    "STATS_AUTO_RECALC",
    "STATS_PERSISTENT",
    "STATS_SAMPLE_PAGES",
    "STATUS",
    "STOP",
    "STORAGE",
    "STORED",
    // (R)
    "STRAIGHT_JOIN",
    // (R)
    "STREAM",
    "STRING",
    "SUBCLASS_ORIGIN",
    "SUBJECT",
    "SUBPARTITION",
    "SUBPARTITIONS",
    "SUPER",
    "SUSPEND",
    "SWAPS",
    "SWITCHES",
    "SYSTEM",
    // (R)
    "TABLE",
    // (R)
    "TABLES",
    "TABLESPACE",
    "TABLE_CHECKSUM",
    "TABLE_NAME",
    "TEMPORARY",
    "TEMPTABLE",
    "TERMINATED",
    // (R)
    "TEXT",
    "THAN",
    "THEN",
    // (R)
    "THREAD_PRIORITY",
    "TIES",
    "TIME",
    "TIMESTAMP",
    "TIMESTAMPADD",
    "TIMESTAMPDIFF",
    "TINYBLOB",
    // (R)
    "TINYINT",
    // (R)
    "TINYTEXT",
    // (R)
    "TLS",
    "TO",
    // (R)
    "TRAILING",
    // (R)
    "TRANSACTION",
    "TRIGGER",
    // (R)
    "TRIGGERS",
    "TRUE",
    // (R)
    "TRUNCATE",
    "TYPE",
    "TYPES",
    "UNBOUNDED",
    "UNCOMMITTED",
    "UNDEFINED",
    "UNDO",
    // (R)
    "UNDOFILE",
    "UNDO_BUFFER_SIZE",
    "UNICODE",
    "UNINSTALL",
    "UNION",
    // (R)
    "UNIQUE",
    // (R)
    "UNKNOWN",
    "UNLOCK",
    // (R)
    "UNREGISTER",
    "UNSIGNED",
    // (R)
    "UNTIL",
    "UPDATE",
    // (R)
    "UPGRADE",
    "USAGE",
    // (R)
    "USE",
    // (R)
    "USER",
    "USER_RESOURCES",
    "USE_FRM",
    "USING",
    // (R)
    "UTC_DATE",
    // (R)
    "UTC_TIME",
    // (R)
    "UTC_TIMESTAMP",
    // (R)
    "VALIDATION",
    "VALUE",
    "VALUES",
    // (R)
    "VARBINARY",
    // (R)
    "VARCHAR",
    // (R)
    "VARCHARACTER",
    // (R)
    "VARIABLES",
    "VARYING",
    // (R)
    "VCPU",
    "VIEW",
    "VIRTUAL",
    // (R)
    "VISIBLE",
    "WAIT",
    "WARNINGS",
    "WEEK",
    "WEIGHT_STRING",
    "WHEN",
    // (R)
    "WHERE",
    // (R)
    "WHILE",
    // (R)
    "WINDOW",
    // (R)
    "WITH",
    // (R)
    "WITHOUT",
    "WORK",
    "WRAPPER",
    "WRITE",
    // (R)
    "X509",
    "XA",
    "XID",
    "XML",
    "XOR",
    // (R)
    "YEAR",
    "YEAR_MONTH",
    // (R)
    "ZEROFILL",
    // (R)
    "ZONE"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/mysql/mysql.functions.js
var functions5 = flatKeywordList({
  // https://dev.mysql.com/doc/refman/8.0/en/built-in-function-reference.html
  all: [
    "ABS",
    "ACOS",
    "ADDDATE",
    "ADDTIME",
    "AES_DECRYPT",
    "AES_ENCRYPT",
    // 'AND',
    "ANY_VALUE",
    "ASCII",
    "ASIN",
    "ATAN",
    "ATAN2",
    "AVG",
    "BENCHMARK",
    "BIN",
    "BIN_TO_UUID",
    "BINARY",
    "BIT_AND",
    "BIT_COUNT",
    "BIT_LENGTH",
    "BIT_OR",
    "BIT_XOR",
    "CAN_ACCESS_COLUMN",
    "CAN_ACCESS_DATABASE",
    "CAN_ACCESS_TABLE",
    "CAN_ACCESS_USER",
    "CAN_ACCESS_VIEW",
    "CAST",
    "CEIL",
    "CEILING",
    "CHAR",
    "CHAR_LENGTH",
    "CHARACTER_LENGTH",
    "CHARSET",
    "COALESCE",
    "COERCIBILITY",
    "COLLATION",
    "COMPRESS",
    "CONCAT",
    "CONCAT_WS",
    "CONNECTION_ID",
    "CONV",
    "CONVERT",
    "CONVERT_TZ",
    "COS",
    "COT",
    "COUNT",
    "CRC32",
    "CUME_DIST",
    "CURDATE",
    "CURRENT_DATE",
    "CURRENT_ROLE",
    "CURRENT_TIME",
    "CURRENT_TIMESTAMP",
    "CURRENT_USER",
    "CURTIME",
    "DATABASE",
    "DATE",
    "DATE_ADD",
    "DATE_FORMAT",
    "DATE_SUB",
    "DATEDIFF",
    "DAY",
    "DAYNAME",
    "DAYOFMONTH",
    "DAYOFWEEK",
    "DAYOFYEAR",
    "DEFAULT",
    "DEGREES",
    "DENSE_RANK",
    "DIV",
    "ELT",
    "EXP",
    "EXPORT_SET",
    "EXTRACT",
    "EXTRACTVALUE",
    "FIELD",
    "FIND_IN_SET",
    "FIRST_VALUE",
    "FLOOR",
    "FORMAT",
    "FORMAT_BYTES",
    "FORMAT_PICO_TIME",
    "FOUND_ROWS",
    "FROM_BASE64",
    "FROM_DAYS",
    "FROM_UNIXTIME",
    "GEOMCOLLECTION",
    "GEOMETRYCOLLECTION",
    "GET_DD_COLUMN_PRIVILEGES",
    "GET_DD_CREATE_OPTIONS",
    "GET_DD_INDEX_SUB_PART_LENGTH",
    "GET_FORMAT",
    "GET_LOCK",
    "GREATEST",
    "GROUP_CONCAT",
    "GROUPING",
    "GTID_SUBSET",
    "GTID_SUBTRACT",
    "HEX",
    "HOUR",
    "ICU_VERSION",
    "IF",
    "IFNULL",
    // 'IN',
    "INET_ATON",
    "INET_NTOA",
    "INET6_ATON",
    "INET6_NTOA",
    "INSERT",
    "INSTR",
    "INTERNAL_AUTO_INCREMENT",
    "INTERNAL_AVG_ROW_LENGTH",
    "INTERNAL_CHECK_TIME",
    "INTERNAL_CHECKSUM",
    "INTERNAL_DATA_FREE",
    "INTERNAL_DATA_LENGTH",
    "INTERNAL_DD_CHAR_LENGTH",
    "INTERNAL_GET_COMMENT_OR_ERROR",
    "INTERNAL_GET_ENABLED_ROLE_JSON",
    "INTERNAL_GET_HOSTNAME",
    "INTERNAL_GET_USERNAME",
    "INTERNAL_GET_VIEW_WARNING_OR_ERROR",
    "INTERNAL_INDEX_COLUMN_CARDINALITY",
    "INTERNAL_INDEX_LENGTH",
    "INTERNAL_IS_ENABLED_ROLE",
    "INTERNAL_IS_MANDATORY_ROLE",
    "INTERNAL_KEYS_DISABLED",
    "INTERNAL_MAX_DATA_LENGTH",
    "INTERNAL_TABLE_ROWS",
    "INTERNAL_UPDATE_TIME",
    "INTERVAL",
    "IS",
    "IS_FREE_LOCK",
    "IS_IPV4",
    "IS_IPV4_COMPAT",
    "IS_IPV4_MAPPED",
    "IS_IPV6",
    "IS NOT",
    "IS NOT NULL",
    "IS NULL",
    "IS_USED_LOCK",
    "IS_UUID",
    "ISNULL",
    "JSON_ARRAY",
    "JSON_ARRAY_APPEND",
    "JSON_ARRAY_INSERT",
    "JSON_ARRAYAGG",
    "JSON_CONTAINS",
    "JSON_CONTAINS_PATH",
    "JSON_DEPTH",
    "JSON_EXTRACT",
    "JSON_INSERT",
    "JSON_KEYS",
    "JSON_LENGTH",
    "JSON_MERGE",
    "JSON_MERGE_PATCH",
    "JSON_MERGE_PRESERVE",
    "JSON_OBJECT",
    "JSON_OBJECTAGG",
    "JSON_OVERLAPS",
    "JSON_PRETTY",
    "JSON_QUOTE",
    "JSON_REMOVE",
    "JSON_REPLACE",
    "JSON_SCHEMA_VALID",
    "JSON_SCHEMA_VALIDATION_REPORT",
    "JSON_SEARCH",
    "JSON_SET",
    "JSON_STORAGE_FREE",
    "JSON_STORAGE_SIZE",
    "JSON_TABLE",
    "JSON_TYPE",
    "JSON_UNQUOTE",
    "JSON_VALID",
    "JSON_VALUE",
    "LAG",
    "LAST_DAY",
    "LAST_INSERT_ID",
    "LAST_VALUE",
    "LCASE",
    "LEAD",
    "LEAST",
    "LEFT",
    "LENGTH",
    "LIKE",
    "LINESTRING",
    "LN",
    "LOAD_FILE",
    "LOCALTIME",
    "LOCALTIMESTAMP",
    "LOCATE",
    "LOG",
    "LOG10",
    "LOG2",
    "LOWER",
    "LPAD",
    "LTRIM",
    "MAKE_SET",
    "MAKEDATE",
    "MAKETIME",
    "MASTER_POS_WAIT",
    "MATCH",
    "MAX",
    "MBRCONTAINS",
    "MBRCOVEREDBY",
    "MBRCOVERS",
    "MBRDISJOINT",
    "MBREQUALS",
    "MBRINTERSECTS",
    "MBROVERLAPS",
    "MBRTOUCHES",
    "MBRWITHIN",
    "MD5",
    "MEMBER OF",
    "MICROSECOND",
    "MID",
    "MIN",
    "MINUTE",
    "MOD",
    "MONTH",
    "MONTHNAME",
    "MULTILINESTRING",
    "MULTIPOINT",
    "MULTIPOLYGON",
    "NAME_CONST",
    "NOT",
    "NOT IN",
    "NOT LIKE",
    "NOT REGEXP",
    "NOW",
    "NTH_VALUE",
    "NTILE",
    "NULLIF",
    "OCT",
    "OCTET_LENGTH",
    // 'OR',
    "ORD",
    "PERCENT_RANK",
    "PERIOD_ADD",
    "PERIOD_DIFF",
    "PI",
    "POINT",
    "POLYGON",
    "POSITION",
    "POW",
    "POWER",
    "PS_CURRENT_THREAD_ID",
    "PS_THREAD_ID",
    "QUARTER",
    "QUOTE",
    "RADIANS",
    "RAND",
    "RANDOM_BYTES",
    "RANK",
    "REGEXP",
    "REGEXP_INSTR",
    "REGEXP_LIKE",
    "REGEXP_REPLACE",
    "REGEXP_SUBSTR",
    "RELEASE_ALL_LOCKS",
    "RELEASE_LOCK",
    "REPEAT",
    "REPLACE",
    "REVERSE",
    "RIGHT",
    "RLIKE",
    "ROLES_GRAPHML",
    "ROUND",
    "ROW_COUNT",
    "ROW_NUMBER",
    "RPAD",
    "RTRIM",
    "SCHEMA",
    "SEC_TO_TIME",
    "SECOND",
    "SESSION_USER",
    "SHA1",
    "SHA2",
    "SIGN",
    "SIN",
    "SLEEP",
    "SOUNDEX",
    "SOUNDS LIKE",
    "SOURCE_POS_WAIT",
    "SPACE",
    "SQRT",
    "ST_AREA",
    "ST_ASBINARY",
    "ST_ASGEOJSON",
    "ST_ASTEXT",
    "ST_BUFFER",
    "ST_BUFFER_STRATEGY",
    "ST_CENTROID",
    "ST_COLLECT",
    "ST_CONTAINS",
    "ST_CONVEXHULL",
    "ST_CROSSES",
    "ST_DIFFERENCE",
    "ST_DIMENSION",
    "ST_DISJOINT",
    "ST_DISTANCE",
    "ST_DISTANCE_SPHERE",
    "ST_ENDPOINT",
    "ST_ENVELOPE",
    "ST_EQUALS",
    "ST_EXTERIORRING",
    "ST_FRECHETDISTANCE",
    "ST_GEOHASH",
    "ST_GEOMCOLLFROMTEXT",
    "ST_GEOMCOLLFROMWKB",
    "ST_GEOMETRYN",
    "ST_GEOMETRYTYPE",
    "ST_GEOMFROMGEOJSON",
    "ST_GEOMFROMTEXT",
    "ST_GEOMFROMWKB",
    "ST_HAUSDORFFDISTANCE",
    "ST_INTERIORRINGN",
    "ST_INTERSECTION",
    "ST_INTERSECTS",
    "ST_ISCLOSED",
    "ST_ISEMPTY",
    "ST_ISSIMPLE",
    "ST_ISVALID",
    "ST_LATFROMGEOHASH",
    "ST_LATITUDE",
    "ST_LENGTH",
    "ST_LINEFROMTEXT",
    "ST_LINEFROMWKB",
    "ST_LINEINTERPOLATEPOINT",
    "ST_LINEINTERPOLATEPOINTS",
    "ST_LONGFROMGEOHASH",
    "ST_LONGITUDE",
    "ST_MAKEENVELOPE",
    "ST_MLINEFROMTEXT",
    "ST_MLINEFROMWKB",
    "ST_MPOINTFROMTEXT",
    "ST_MPOINTFROMWKB",
    "ST_MPOLYFROMTEXT",
    "ST_MPOLYFROMWKB",
    "ST_NUMGEOMETRIES",
    "ST_NUMINTERIORRING",
    "ST_NUMPOINTS",
    "ST_OVERLAPS",
    "ST_POINTATDISTANCE",
    "ST_POINTFROMGEOHASH",
    "ST_POINTFROMTEXT",
    "ST_POINTFROMWKB",
    "ST_POINTN",
    "ST_POLYFROMTEXT",
    "ST_POLYFROMWKB",
    "ST_SIMPLIFY",
    "ST_SRID",
    "ST_STARTPOINT",
    "ST_SWAPXY",
    "ST_SYMDIFFERENCE",
    "ST_TOUCHES",
    "ST_TRANSFORM",
    "ST_UNION",
    "ST_VALIDATE",
    "ST_WITHIN",
    "ST_X",
    "ST_Y",
    "STATEMENT_DIGEST",
    "STATEMENT_DIGEST_TEXT",
    "STD",
    "STDDEV",
    "STDDEV_POP",
    "STDDEV_SAMP",
    "STR_TO_DATE",
    "STRCMP",
    "SUBDATE",
    "SUBSTR",
    "SUBSTRING",
    "SUBSTRING_INDEX",
    "SUBTIME",
    "SUM",
    "SYSDATE",
    "SYSTEM_USER",
    "TAN",
    "TIME",
    "TIME_FORMAT",
    "TIME_TO_SEC",
    "TIMEDIFF",
    "TIMESTAMP",
    "TIMESTAMPADD",
    "TIMESTAMPDIFF",
    "TO_BASE64",
    "TO_DAYS",
    "TO_SECONDS",
    "TRIM",
    "TRUNCATE",
    "UCASE",
    "UNCOMPRESS",
    "UNCOMPRESSED_LENGTH",
    "UNHEX",
    "UNIX_TIMESTAMP",
    "UPDATEXML",
    "UPPER",
    "USER",
    "UTC_DATE",
    "UTC_TIME",
    "UTC_TIMESTAMP",
    "UUID",
    "UUID_SHORT",
    "UUID_TO_BIN",
    "VALIDATE_PASSWORD_STRENGTH",
    "VALUES",
    "VAR_POP",
    "VAR_SAMP",
    "VARIANCE",
    "VERSION",
    "WAIT_FOR_EXECUTED_GTID_SET",
    "WAIT_UNTIL_SQL_THREAD_AFTER_GTIDS",
    "WEEK",
    "WEEKDAY",
    "WEEKOFYEAR",
    "WEIGHT_STRING",
    // 'XOR',
    "YEAR",
    "YEARWEEK",
    // Data types with parameters
    // https://dev.mysql.com/doc/refman/8.0/en/data-types.html
    "BIT",
    "TINYINT",
    "SMALLINT",
    "MEDIUMINT",
    "INT",
    "INTEGER",
    "BIGINT",
    "DECIMAL",
    "DEC",
    "NUMERIC",
    "FIXED",
    "FLOAT",
    "DOUBLE",
    "DOUBLE PRECISION",
    "REAL",
    "DATETIME",
    "TIMESTAMP",
    "TIME",
    "YEAR",
    "CHAR",
    "NATIONAL CHAR",
    "VARCHAR",
    "NATIONAL VARCHAR",
    "BINARY",
    "VARBINARY",
    "BLOB",
    "TEXT",
    "ENUM"
    // 'SET' // handled as special-case in postProcess
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/mysql/mysql.formatter.js
var reservedSelect5 = expandPhrases(["SELECT [ALL | DISTINCT | DISTINCTROW]"]);
var reservedClauses5 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE] [INTO]",
  "REPLACE [LOW_PRIORITY | DELAYED] [INTO]",
  "VALUES",
  // - update:
  "SET",
  // Data definition
  "CREATE [OR REPLACE] [SQL SECURITY DEFINER | SQL SECURITY INVOKER] VIEW [IF NOT EXISTS]",
  "CREATE [TEMPORARY] TABLE [IF NOT EXISTS]"
]);
var onelineClauses5 = expandPhrases([
  // - update:
  "UPDATE [LOW_PRIORITY] [IGNORE]",
  // - delete:
  "DELETE [LOW_PRIORITY] [QUICK] [IGNORE] FROM",
  // - drop table:
  "DROP [TEMPORARY] TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "ADD [COLUMN]",
  "{CHANGE | MODIFY} [COLUMN]",
  "DROP [COLUMN]",
  "RENAME [TO | AS]",
  "RENAME COLUMN",
  "ALTER [COLUMN]",
  "{SET | DROP} DEFAULT",
  // for alter column
  // - truncate:
  "TRUNCATE [TABLE]",
  // https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html
  "ALTER DATABASE",
  "ALTER EVENT",
  "ALTER FUNCTION",
  "ALTER INSTANCE",
  "ALTER LOGFILE GROUP",
  "ALTER PROCEDURE",
  "ALTER RESOURCE GROUP",
  "ALTER SERVER",
  "ALTER TABLESPACE",
  "ALTER USER",
  "ALTER VIEW",
  "ANALYZE TABLE",
  "BINLOG",
  "CACHE INDEX",
  "CALL",
  "CHANGE MASTER TO",
  "CHANGE REPLICATION FILTER",
  "CHANGE REPLICATION SOURCE TO",
  "CHECK TABLE",
  "CHECKSUM TABLE",
  "CLONE",
  "COMMIT",
  "CREATE DATABASE",
  "CREATE EVENT",
  "CREATE FUNCTION",
  "CREATE FUNCTION",
  "CREATE INDEX",
  "CREATE LOGFILE GROUP",
  "CREATE PROCEDURE",
  "CREATE RESOURCE GROUP",
  "CREATE ROLE",
  "CREATE SERVER",
  "CREATE SPATIAL REFERENCE SYSTEM",
  "CREATE TABLESPACE",
  "CREATE TRIGGER",
  "CREATE USER",
  "DEALLOCATE PREPARE",
  "DESCRIBE",
  "DROP DATABASE",
  "DROP EVENT",
  "DROP FUNCTION",
  "DROP FUNCTION",
  "DROP INDEX",
  "DROP LOGFILE GROUP",
  "DROP PROCEDURE",
  "DROP RESOURCE GROUP",
  "DROP ROLE",
  "DROP SERVER",
  "DROP SPATIAL REFERENCE SYSTEM",
  "DROP TABLESPACE",
  "DROP TRIGGER",
  "DROP USER",
  "DROP VIEW",
  "EXECUTE",
  "EXPLAIN",
  "FLUSH",
  "GRANT",
  "HANDLER",
  "HELP",
  "IMPORT TABLE",
  "INSTALL COMPONENT",
  "INSTALL PLUGIN",
  "KILL",
  "LOAD DATA",
  "LOAD INDEX INTO CACHE",
  "LOAD XML",
  "LOCK INSTANCE FOR BACKUP",
  "LOCK TABLES",
  "MASTER_POS_WAIT",
  "OPTIMIZE TABLE",
  "PREPARE",
  "PURGE BINARY LOGS",
  "RELEASE SAVEPOINT",
  "RENAME TABLE",
  "RENAME USER",
  "REPAIR TABLE",
  "RESET",
  "RESET MASTER",
  "RESET PERSIST",
  "RESET REPLICA",
  "RESET SLAVE",
  "RESTART",
  "REVOKE",
  "ROLLBACK",
  "ROLLBACK TO SAVEPOINT",
  "SAVEPOINT",
  "SET CHARACTER SET",
  "SET DEFAULT ROLE",
  "SET NAMES",
  "SET PASSWORD",
  "SET RESOURCE GROUP",
  "SET ROLE",
  "SET TRANSACTION",
  "SHOW",
  "SHOW BINARY LOGS",
  "SHOW BINLOG EVENTS",
  "SHOW CHARACTER SET",
  "SHOW COLLATION",
  "SHOW COLUMNS",
  "SHOW CREATE DATABASE",
  "SHOW CREATE EVENT",
  "SHOW CREATE FUNCTION",
  "SHOW CREATE PROCEDURE",
  "SHOW CREATE TABLE",
  "SHOW CREATE TRIGGER",
  "SHOW CREATE USER",
  "SHOW CREATE VIEW",
  "SHOW DATABASES",
  "SHOW ENGINE",
  "SHOW ENGINES",
  "SHOW ERRORS",
  "SHOW EVENTS",
  "SHOW FUNCTION CODE",
  "SHOW FUNCTION STATUS",
  "SHOW GRANTS",
  "SHOW INDEX",
  "SHOW MASTER STATUS",
  "SHOW OPEN TABLES",
  "SHOW PLUGINS",
  "SHOW PRIVILEGES",
  "SHOW PROCEDURE CODE",
  "SHOW PROCEDURE STATUS",
  "SHOW PROCESSLIST",
  "SHOW PROFILE",
  "SHOW PROFILES",
  "SHOW RELAYLOG EVENTS",
  "SHOW REPLICA STATUS",
  "SHOW REPLICAS",
  "SHOW SLAVE",
  "SHOW SLAVE HOSTS",
  "SHOW STATUS",
  "SHOW TABLE STATUS",
  "SHOW TABLES",
  "SHOW TRIGGERS",
  "SHOW VARIABLES",
  "SHOW WARNINGS",
  "SHUTDOWN",
  "SOURCE_POS_WAIT",
  "START GROUP_REPLICATION",
  "START REPLICA",
  "START SLAVE",
  "START TRANSACTION",
  "STOP GROUP_REPLICATION",
  "STOP REPLICA",
  "STOP SLAVE",
  "TABLE",
  "UNINSTALL COMPONENT",
  "UNINSTALL PLUGIN",
  "UNLOCK INSTANCE",
  "UNLOCK TABLES",
  "USE",
  "XA",
  // flow control
  // 'IF',
  "ITERATE",
  "LEAVE",
  "LOOP",
  "REPEAT",
  "RETURN",
  "WHILE"
]);
var reservedSetOperations5 = expandPhrases(["UNION [ALL | DISTINCT]"]);
var reservedJoins5 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT} [OUTER] JOIN",
  // non-standard joins
  "STRAIGHT_JOIN"
]);
var reservedPhrases5 = expandPhrases(["ON {UPDATE | DELETE} [SET NULL]", "CHARACTER SET", "{ROWS | RANGE} BETWEEN"]);
var mysql = {
  tokenizerOptions: {
    reservedSelect: reservedSelect5,
    reservedClauses: [...reservedClauses5, ...onelineClauses5],
    reservedSetOperations: reservedSetOperations5,
    reservedJoins: reservedJoins5,
    reservedPhrases: reservedPhrases5,
    supportsXor: true,
    reservedKeywords: keywords5,
    reservedFunctionNames: functions5,
    // TODO: support _ char set prefixes such as _utf8, _latin1, _binary, _utf8mb4, etc.
    stringTypes: ['""-qq-bs', {
      quote: "''-qq-bs",
      prefixes: ["N"]
    }, {
      quote: "''-raw",
      prefixes: ["B", "X"],
      requirePrefix: true
    }],
    identTypes: ["``"],
    identChars: {
      first: "$",
      rest: "$",
      allowFirstCharNumber: true
    },
    variableTypes: [{
      regex: "@@?[A-Za-z0-9_.$]+"
    }, {
      quote: '""-qq-bs',
      prefixes: ["@"],
      requirePrefix: true
    }, {
      quote: "''-qq-bs",
      prefixes: ["@"],
      requirePrefix: true
    }, {
      quote: "``",
      prefixes: ["@"],
      requirePrefix: true
    }],
    paramTypes: {
      positional: true
    },
    lineCommentTypes: ["--", "#"],
    operators: ["%", ":=", "&", "|", "^", "~", "<<", ">>", "<=>", "->", "->>", "&&", "||", "!"],
    postProcess: postProcess3
  },
  formatOptions: {
    onelineClauses: onelineClauses5
  }
};
function postProcess3(tokens) {
  return tokens.map((token, i) => {
    const nextToken = tokens[i + 1] || EOF_TOKEN;
    if (isToken.SET(token) && nextToken.text === "(") {
      return {
        ...token,
        type: TokenType.RESERVED_FUNCTION_NAME
      };
    }
    return token;
  });
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/n1ql/n1ql.functions.js
var functions6 = flatKeywordList({
  // https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/functions.html
  all: [
    "ABORT",
    "ABS",
    "ACOS",
    "ADVISOR",
    "ARRAY_AGG",
    "ARRAY_AGG",
    "ARRAY_APPEND",
    "ARRAY_AVG",
    "ARRAY_BINARY_SEARCH",
    "ARRAY_CONCAT",
    "ARRAY_CONTAINS",
    "ARRAY_COUNT",
    "ARRAY_DISTINCT",
    "ARRAY_EXCEPT",
    "ARRAY_FLATTEN",
    "ARRAY_IFNULL",
    "ARRAY_INSERT",
    "ARRAY_INTERSECT",
    "ARRAY_LENGTH",
    "ARRAY_MAX",
    "ARRAY_MIN",
    "ARRAY_MOVE",
    "ARRAY_POSITION",
    "ARRAY_PREPEND",
    "ARRAY_PUT",
    "ARRAY_RANGE",
    "ARRAY_REMOVE",
    "ARRAY_REPEAT",
    "ARRAY_REPLACE",
    "ARRAY_REVERSE",
    "ARRAY_SORT",
    "ARRAY_STAR",
    "ARRAY_SUM",
    "ARRAY_SYMDIFF",
    "ARRAY_SYMDIFF1",
    "ARRAY_SYMDIFFN",
    "ARRAY_UNION",
    "ASIN",
    "ATAN",
    "ATAN2",
    "AVG",
    "BASE64",
    "BASE64_DECODE",
    "BASE64_ENCODE",
    "BITAND ",
    "BITCLEAR ",
    "BITNOT ",
    "BITOR ",
    "BITSET ",
    "BITSHIFT ",
    "BITTEST ",
    "BITXOR ",
    "CEIL",
    "CLOCK_LOCAL",
    "CLOCK_MILLIS",
    "CLOCK_STR",
    "CLOCK_TZ",
    "CLOCK_UTC",
    "COALESCE",
    "CONCAT",
    "CONCAT2",
    "CONTAINS",
    "CONTAINS_TOKEN",
    "CONTAINS_TOKEN_LIKE",
    "CONTAINS_TOKEN_REGEXP",
    "COS",
    "COUNT",
    "COUNT",
    "COUNTN",
    "CUME_DIST",
    "CURL",
    "DATE_ADD_MILLIS",
    "DATE_ADD_STR",
    "DATE_DIFF_MILLIS",
    "DATE_DIFF_STR",
    "DATE_FORMAT_STR",
    "DATE_PART_MILLIS",
    "DATE_PART_STR",
    "DATE_RANGE_MILLIS",
    "DATE_RANGE_STR",
    "DATE_TRUNC_MILLIS",
    "DATE_TRUNC_STR",
    "DECODE",
    "DECODE_JSON",
    "DEGREES",
    "DENSE_RANK",
    "DURATION_TO_STR",
    // 'E',
    "ENCODED_SIZE",
    "ENCODE_JSON",
    "EXP",
    "FIRST_VALUE",
    "FLOOR",
    "GREATEST",
    "HAS_TOKEN",
    "IFINF",
    "IFMISSING",
    "IFMISSINGORNULL",
    "IFNAN",
    "IFNANORINF",
    "IFNULL",
    "INITCAP",
    "ISARRAY",
    "ISATOM",
    "ISBITSET",
    "ISBOOLEAN",
    "ISNUMBER",
    "ISOBJECT",
    "ISSTRING",
    "LAG",
    "LAST_VALUE",
    "LEAD",
    "LEAST",
    "LENGTH",
    "LN",
    "LOG",
    "LOWER",
    "LTRIM",
    "MAX",
    "MEAN",
    "MEDIAN",
    "META",
    "MILLIS",
    "MILLIS_TO_LOCAL",
    "MILLIS_TO_STR",
    "MILLIS_TO_TZ",
    "MILLIS_TO_UTC",
    "MILLIS_TO_ZONE_NAME",
    "MIN",
    "MISSINGIF",
    "NANIF",
    "NEGINFIF",
    "NOW_LOCAL",
    "NOW_MILLIS",
    "NOW_STR",
    "NOW_TZ",
    "NOW_UTC",
    "NTH_VALUE",
    "NTILE",
    "NULLIF",
    "NVL",
    "NVL2",
    "OBJECT_ADD",
    "OBJECT_CONCAT",
    "OBJECT_INNER_PAIRS",
    "OBJECT_INNER_VALUES",
    "OBJECT_LENGTH",
    "OBJECT_NAMES",
    "OBJECT_PAIRS",
    "OBJECT_PUT",
    "OBJECT_REMOVE",
    "OBJECT_RENAME",
    "OBJECT_REPLACE",
    "OBJECT_UNWRAP",
    "OBJECT_VALUES",
    "PAIRS",
    "PERCENT_RANK",
    "PI",
    "POLY_LENGTH",
    "POSINFIF",
    "POSITION",
    "POWER",
    "RADIANS",
    "RANDOM",
    "RANK",
    "RATIO_TO_REPORT",
    "REGEXP_CONTAINS",
    "REGEXP_LIKE",
    "REGEXP_MATCHES",
    "REGEXP_POSITION",
    "REGEXP_REPLACE",
    "REGEXP_SPLIT",
    "REGEX_CONTAINS",
    "REGEX_LIKE",
    "REGEX_MATCHES",
    "REGEX_POSITION",
    "REGEX_REPLACE",
    "REGEX_SPLIT",
    "REPEAT",
    "REPLACE",
    "REVERSE",
    "ROUND",
    "ROW_NUMBER",
    "RTRIM",
    "SEARCH",
    "SEARCH_META",
    "SEARCH_SCORE",
    "SIGN",
    "SIN",
    "SPLIT",
    "SQRT",
    "STDDEV",
    "STDDEV_POP",
    "STDDEV_SAMP",
    "STR_TO_DURATION",
    "STR_TO_MILLIS",
    "STR_TO_TZ",
    "STR_TO_UTC",
    "STR_TO_ZONE_NAME",
    "SUBSTR",
    "SUFFIXES",
    "SUM",
    "TAN",
    "TITLE",
    "TOARRAY",
    "TOATOM",
    "TOBOOLEAN",
    "TOKENS",
    "TOKENS",
    "TONUMBER",
    "TOOBJECT",
    "TOSTRING",
    "TRIM",
    "TRUNC",
    // 'TYPE', // disabled
    "UPPER",
    "UUID",
    "VARIANCE",
    "VARIANCE_POP",
    "VARIANCE_SAMP",
    "VAR_POP",
    "VAR_SAMP",
    "WEEKDAY_MILLIS",
    "WEEKDAY_STR",
    // type casting
    // not implemented in N1QL, but added here now for the sake of tests
    // https://docs.couchbase.com/server/current/analytics/3_query.html#Vs_SQL-92
    "CAST"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/n1ql/n1ql.keywords.js
var keywords6 = flatKeywordList({
  // https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/reservedwords.html
  all: ["ADVISE", "ALL", "ALTER", "ANALYZE", "AND", "ANY", "ARRAY", "AS", "ASC", "AT", "BEGIN", "BETWEEN", "BINARY", "BOOLEAN", "BREAK", "BUCKET", "BUILD", "BY", "CALL", "CASE", "CAST", "CLUSTER", "COLLATE", "COLLECTION", "COMMIT", "COMMITTED", "CONNECT", "CONTINUE", "CORRELATED", "COVER", "CREATE", "CURRENT", "DATABASE", "DATASET", "DATASTORE", "DECLARE", "DECREMENT", "DELETE", "DERIVED", "DESC", "DESCRIBE", "DISTINCT", "DO", "DROP", "EACH", "ELEMENT", "ELSE", "END", "EVERY", "EXCEPT", "EXCLUDE", "EXECUTE", "EXISTS", "EXPLAIN", "FALSE", "FETCH", "FILTER", "FIRST", "FLATTEN", "FLUSH", "FOLLOWING", "FOR", "FORCE", "FROM", "FTS", "FUNCTION", "GOLANG", "GRANT", "GROUP", "GROUPS", "GSI", "HASH", "HAVING", "IF", "ISOLATION", "IGNORE", "ILIKE", "IN", "INCLUDE", "INCREMENT", "INDEX", "INFER", "INLINE", "INNER", "INSERT", "INTERSECT", "INTO", "IS", "JAVASCRIPT", "JOIN", "KEY", "KEYS", "KEYSPACE", "KNOWN", "LANGUAGE", "LAST", "LEFT", "LET", "LETTING", "LEVEL", "LIKE", "LIMIT", "LSM", "MAP", "MAPPING", "MATCHED", "MATERIALIZED", "MERGE", "MINUS", "MISSING", "NAMESPACE", "NEST", "NL", "NO", "NOT", "NTH_VALUE", "NULL", "NULLS", "NUMBER", "OBJECT", "OFFSET", "ON", "OPTION", "OPTIONS", "OR", "ORDER", "OTHERS", "OUTER", "OVER", "PARSE", "PARTITION", "PASSWORD", "PATH", "POOL", "PRECEDING", "PREPARE", "PRIMARY", "PRIVATE", "PRIVILEGE", "PROBE", "PROCEDURE", "PUBLIC", "RANGE", "RAW", "REALM", "REDUCE", "RENAME", "RESPECT", "RETURN", "RETURNING", "REVOKE", "RIGHT", "ROLE", "ROLLBACK", "ROW", "ROWS", "SATISFIES", "SAVEPOINT", "SCHEMA", "SCOPE", "SELECT", "SELF", "SEMI", "SET", "SHOW", "SOME", "START", "STATISTICS", "STRING", "SYSTEM", "THEN", "TIES", "TO", "TRAN", "TRANSACTION", "TRIGGER", "TRUE", "TRUNCATE", "UNBOUNDED", "UNDER", "UNION", "UNIQUE", "UNKNOWN", "UNNEST", "UNSET", "UPDATE", "UPSERT", "USE", "USER", "USING", "VALIDATE", "VALUE", "VALUED", "VALUES", "VIA", "VIEW", "WHEN", "WHERE", "WHILE", "WINDOW", "WITH", "WITHIN", "WORK", "XOR"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/n1ql/n1ql.formatter.js
var reservedSelect6 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses6 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE INTO",
  "WHEN [NOT] MATCHED THEN",
  "UPDATE SET",
  "INSERT",
  // other
  "NEST",
  "UNNEST",
  "RETURNING"
]);
var onelineClauses6 = expandPhrases([
  // - update:
  "UPDATE",
  // - delete:
  "DELETE FROM",
  // - set schema:
  "SET SCHEMA",
  // https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/reservedwords.html
  "ADVISE",
  "ALTER INDEX",
  "BEGIN TRANSACTION",
  "BUILD INDEX",
  "COMMIT TRANSACTION",
  "CREATE COLLECTION",
  "CREATE FUNCTION",
  "CREATE INDEX",
  "CREATE PRIMARY INDEX",
  "CREATE SCOPE",
  "DROP COLLECTION",
  "DROP FUNCTION",
  "DROP INDEX",
  "DROP PRIMARY INDEX",
  "DROP SCOPE",
  "EXECUTE",
  "EXECUTE FUNCTION",
  "EXPLAIN",
  "GRANT",
  "INFER",
  "PREPARE",
  "REVOKE",
  "ROLLBACK TRANSACTION",
  "SAVEPOINT",
  "SET TRANSACTION",
  "UPDATE STATISTICS",
  "UPSERT",
  // other
  "LET",
  "SET CURRENT SCHEMA",
  "SHOW",
  "USE [PRIMARY] KEYS"
]);
var reservedSetOperations6 = expandPhrases(["UNION [ALL]", "EXCEPT [ALL]", "INTERSECT [ALL]"]);
var reservedJoins6 = expandPhrases(["JOIN", "{LEFT | RIGHT} [OUTER] JOIN", "INNER JOIN"]);
var reservedPhrases6 = expandPhrases(["{ROWS | RANGE | GROUPS} BETWEEN"]);
var n1ql = {
  tokenizerOptions: {
    reservedSelect: reservedSelect6,
    reservedClauses: [...reservedClauses6, ...onelineClauses6],
    reservedSetOperations: reservedSetOperations6,
    reservedJoins: reservedJoins6,
    reservedPhrases: reservedPhrases6,
    supportsXor: true,
    reservedKeywords: keywords6,
    reservedFunctionNames: functions6,
    // NOTE: single quotes are actually not supported in N1QL,
    // but we support them anyway as all other SQL dialects do,
    // which simplifies writing tests that are shared between all dialects.
    stringTypes: ['""-bs', "''-bs"],
    identTypes: ["``"],
    extraParens: ["[]", "{}"],
    paramTypes: {
      positional: true,
      numbered: ["$"],
      named: ["$"]
    },
    lineCommentTypes: ["#", "--"],
    operators: ["%", "==", ":", "||"]
  },
  formatOptions: {
    onelineClauses: onelineClauses6
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/plsql/plsql.keywords.js
var keywords7 = flatKeywordList({
  // https://docs.oracle.com/cd/B19306_01/appdev.102/b14261/reservewords.htm
  all: [
    // 'A',
    "ADD",
    "AGENT",
    "AGGREGATE",
    "ALL",
    "ALTER",
    "AND",
    "ANY",
    "ARRAY",
    "ARROW",
    "AS",
    "ASC",
    "AT",
    "ATTRIBUTE",
    "AUTHID",
    "AVG",
    "BEGIN",
    "BETWEEN",
    "BFILE_BASE",
    "BINARY",
    "BLOB_BASE",
    "BLOCK",
    "BODY",
    "BOTH",
    "BOUND",
    "BULK",
    "BY",
    "BYTE",
    // 'C',
    "CALL",
    "CALLING",
    "CASCADE",
    "CASE",
    "CHAR",
    "CHAR_BASE",
    "CHARACTER",
    "CHARSET",
    "CHARSETFORM",
    "CHARSETID",
    "CHECK",
    "CLOB_BASE",
    "CLOSE",
    "CLUSTER",
    "CLUSTERS",
    "COLAUTH",
    "COLLECT",
    "COLUMNS",
    "COMMENT",
    "COMMIT",
    "COMMITTED",
    "COMPILED",
    "COMPRESS",
    "CONNECT",
    "CONSTANT",
    "CONSTRUCTOR",
    "CONTEXT",
    "CONVERT",
    "COUNT",
    "CRASH",
    "CREATE",
    "CURRENT",
    "CURSOR",
    "CUSTOMDATUM",
    "DANGLING",
    "DATA",
    "DATE",
    "DATE_BASE",
    "DAY",
    "DECIMAL",
    "DECLARE",
    "DEFAULT",
    "DEFINE",
    "DELETE",
    "DESC",
    "DETERMINISTIC",
    "DISTINCT",
    "DOUBLE",
    "DROP",
    "DURATION",
    "ELEMENT",
    "ELSE",
    "ELSIF",
    "EMPTY",
    "END",
    "ESCAPE",
    "EXCEPT",
    "EXCEPTION",
    "EXCEPTIONS",
    "EXCLUSIVE",
    "EXECUTE",
    "EXISTS",
    "EXIT",
    "EXTERNAL",
    "FETCH",
    "FINAL",
    "FIXED",
    "FLOAT",
    "FOR",
    "FORALL",
    "FORCE",
    "FORM",
    "FROM",
    "FUNCTION",
    "GENERAL",
    "GOTO",
    "GRANT",
    "GROUP",
    "HASH",
    "HAVING",
    "HEAP",
    "HIDDEN",
    "HOUR",
    "IDENTIFIED",
    "IF",
    "IMMEDIATE",
    "IN",
    "INCLUDING",
    "INDEX",
    "INDEXES",
    "INDICATOR",
    "INDICES",
    "INFINITE",
    "INSERT",
    "INSTANTIABLE",
    "INT",
    "INTERFACE",
    "INTERSECT",
    "INTERVAL",
    "INTO",
    "INVALIDATE",
    "IS",
    "ISOLATION",
    "JAVA",
    "LANGUAGE",
    "LARGE",
    "LEADING",
    "LENGTH",
    "LEVEL",
    "LIBRARY",
    "LIKE",
    "LIKE2",
    "LIKE4",
    "LIKEC",
    "LIMIT",
    "LIMITED",
    "LOCAL",
    "LOCK",
    "LONG",
    "LOOP",
    "MAP",
    "MAX",
    "MAXLEN",
    "MEMBER",
    "MERGE",
    "MIN",
    "MINUS",
    "MINUTE",
    "MOD",
    "MODE",
    "MODIFY",
    "MONTH",
    "MULTISET",
    "NAME",
    "NAN",
    "NATIONAL",
    "NATIVE",
    "NCHAR",
    "NEW",
    "NOCOMPRESS",
    "NOCOPY",
    "NOT",
    "NOWAIT",
    "NULL",
    "NUMBER_BASE",
    "OBJECT",
    "OCICOLL",
    "OCIDATE",
    "OCIDATETIME",
    "OCIDURATION",
    "OCIINTERVAL",
    "OCILOBLOCATOR",
    "OCINUMBER",
    "OCIRAW",
    "OCIREF",
    "OCIREFCURSOR",
    "OCIROWID",
    "OCISTRING",
    "OCITYPE",
    "OF",
    "ON",
    "ONLY",
    "OPAQUE",
    "OPEN",
    "OPERATOR",
    "OPTION",
    "OR",
    "ORACLE",
    "ORADATA",
    "ORDER",
    "OVERLAPS",
    "ORGANIZATION",
    "ORLANY",
    "ORLVARY",
    "OTHERS",
    "OUT",
    "OVERRIDING",
    "PACKAGE",
    "PARALLEL_ENABLE",
    "PARAMETER",
    "PARAMETERS",
    "PARTITION",
    "PASCAL",
    "PIPE",
    "PIPELINED",
    "PRAGMA",
    "PRECISION",
    "PRIOR",
    "PRIVATE",
    "PROCEDURE",
    "PUBLIC",
    "RAISE",
    "RANGE",
    "RAW",
    "READ",
    "RECORD",
    "REF",
    "REFERENCE",
    "REM",
    "REMAINDER",
    "RENAME",
    "RESOURCE",
    "RESULT",
    "RETURN",
    "RETURNING",
    "REVERSE",
    "REVOKE",
    "ROLLBACK",
    "ROW",
    "SAMPLE",
    "SAVE",
    "SAVEPOINT",
    "SB1",
    "SB2",
    "SB4",
    "SECOND",
    "SEGMENT",
    "SELECT",
    "SELF",
    "SEPARATE",
    "SEQUENCE",
    "SERIALIZABLE",
    "SET",
    "SHARE",
    "SHORT",
    "SIZE",
    "SIZE_T",
    "SOME",
    "SPARSE",
    "SQL",
    "SQLCODE",
    "SQLDATA",
    "SQLNAME",
    "SQLSTATE",
    "STANDARD",
    "START",
    "STATIC",
    "STDDEV",
    "STORED",
    "STRING",
    "STRUCT",
    "STYLE",
    "SUBMULTISET",
    "SUBPARTITION",
    "SUBSTITUTABLE",
    "SUBTYPE",
    "SUM",
    "SYNONYM",
    "TABAUTH",
    "TABLE",
    "TDO",
    "THE",
    "THEN",
    "TIME",
    "TIMESTAMP",
    "TIMEZONE_ABBR",
    "TIMEZONE_HOUR",
    "TIMEZONE_MINUTE",
    "TIMEZONE_REGION",
    "TO",
    "TRAILING",
    "TRANSAC",
    "TRANSACTIONAL",
    "TRUSTED",
    "TYPE",
    "UB1",
    "UB2",
    "UB4",
    "UNDER",
    "UNION",
    "UNIQUE",
    "UNSIGNED",
    "UNTRUSTED",
    "UPDATE",
    "USE",
    "USING",
    "VALIST",
    "VALUE",
    "VALUES",
    "VARIABLE",
    "VARIANCE",
    "VARRAY",
    "VARYING",
    "VIEW",
    "VIEWS",
    "VOID",
    "WHEN",
    "WHERE",
    "WHILE",
    "WITH",
    "WORK",
    "WRAPPED",
    "WRITE",
    "YEAR",
    "ZONE"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/plsql/plsql.functions.js
var functions7 = flatKeywordList({
  // https://docs.oracle.com/cd/B19306_01/server.102/b14200/functions001.htm
  numeric: ["ABS", "ACOS", "ASIN", "ATAN", "ATAN2", "BITAND", "CEIL", "COS", "COSH", "EXP", "FLOOR", "LN", "LOG", "MOD", "NANVL", "POWER", "REMAINDER", "ROUND", "SIGN", "SIN", "SINH", "SQRT", "TAN", "TANH", "TRUNC", "WIDTH_BUCKET"],
  character: ["CHR", "CONCAT", "INITCAP", "LOWER", "LPAD", "LTRIM", "NLS_INITCAP", "NLS_LOWER", "NLSSORT", "NLS_UPPER", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REPLACE", "RPAD", "RTRIM", "SOUNDEX", "SUBSTR", "TRANSLATE", "TREAT", "TRIM", "UPPER", "NLS_CHARSET_DECL_LEN", "NLS_CHARSET_ID", "NLS_CHARSET_NAME", "ASCII", "INSTR", "LENGTH", "REGEXP_INSTR"],
  datetime: ["ADD_MONTHS", "CURRENT_DATE", "CURRENT_TIMESTAMP", "DBTIMEZONE", "EXTRACT", "FROM_TZ", "LAST_DAY", "LOCALTIMESTAMP", "MONTHS_BETWEEN", "NEW_TIME", "NEXT_DAY", "NUMTODSINTERVAL", "NUMTOYMINTERVAL", "ROUND", "SESSIONTIMEZONE", "SYS_EXTRACT_UTC", "SYSDATE", "SYSTIMESTAMP", "TO_CHAR", "TO_TIMESTAMP", "TO_TIMESTAMP_TZ", "TO_DSINTERVAL", "TO_YMINTERVAL", "TRUNC", "TZ_OFFSET"],
  comparison: ["GREATEST", "LEAST"],
  conversion: ["ASCIISTR", "BIN_TO_NUM", "CAST", "CHARTOROWID", "COMPOSE", "CONVERT", "DECOMPOSE", "HEXTORAW", "NUMTODSINTERVAL", "NUMTOYMINTERVAL", "RAWTOHEX", "RAWTONHEX", "ROWIDTOCHAR", "ROWIDTONCHAR", "SCN_TO_TIMESTAMP", "TIMESTAMP_TO_SCN", "TO_BINARY_DOUBLE", "TO_BINARY_FLOAT", "TO_CHAR", "TO_CLOB", "TO_DATE", "TO_DSINTERVAL", "TO_LOB", "TO_MULTI_BYTE", "TO_NCHAR", "TO_NCLOB", "TO_NUMBER", "TO_DSINTERVAL", "TO_SINGLE_BYTE", "TO_TIMESTAMP", "TO_TIMESTAMP_TZ", "TO_YMINTERVAL", "TO_YMINTERVAL", "TRANSLATE", "UNISTR"],
  largeObject: ["BFILENAME", "EMPTY_BLOB,", "EMPTY_CLOB"],
  collection: ["CARDINALITY", "COLLECT", "POWERMULTISET", "POWERMULTISET_BY_CARDINALITY", "SET"],
  hierarchical: ["SYS_CONNECT_BY_PATH"],
  dataMining: ["CLUSTER_ID", "CLUSTER_PROBABILITY", "CLUSTER_SET", "FEATURE_ID", "FEATURE_SET", "FEATURE_VALUE", "PREDICTION", "PREDICTION_COST", "PREDICTION_DETAILS", "PREDICTION_PROBABILITY", "PREDICTION_SET"],
  xml: ["APPENDCHILDXML", "DELETEXML", "DEPTH", "EXTRACT", "EXISTSNODE", "EXTRACTVALUE", "INSERTCHILDXML", "INSERTXMLBEFORE", "PATH", "SYS_DBURIGEN", "SYS_XMLAGG", "SYS_XMLGEN", "UPDATEXML", "XMLAGG", "XMLCDATA", "XMLCOLATTVAL", "XMLCOMMENT", "XMLCONCAT", "XMLFOREST", "XMLPARSE", "XMLPI", "XMLQUERY", "XMLROOT", "XMLSEQUENCE", "XMLSERIALIZE", "XMLTABLE", "XMLTRANSFORM"],
  encoding: ["DECODE", "DUMP", "ORA_HASH", "VSIZE"],
  nullRelated: ["COALESCE", "LNNVL", "NULLIF", "NVL", "NVL2"],
  env: ["SYS_CONTEXT", "SYS_GUID", "SYS_TYPEID", "UID", "USER", "USERENV"],
  aggregate: ["AVG", "COLLECT", "CORR", "CORR_S", "CORR_K", "COUNT", "COVAR_POP", "COVAR_SAMP", "CUME_DIST", "DENSE_RANK", "FIRST", "GROUP_ID", "GROUPING", "GROUPING_ID", "LAST", "MAX", "MEDIAN", "MIN", "PERCENTILE_CONT", "PERCENTILE_DISC", "PERCENT_RANK", "RANK", "REGR_SLOPE", "REGR_INTERCEPT", "REGR_COUNT", "REGR_R2", "REGR_AVGX", "REGR_AVGY", "REGR_SXX", "REGR_SYY", "REGR_SXY", "STATS_BINOMIAL_TEST", "STATS_CROSSTAB", "STATS_F_TEST", "STATS_KS_TEST", "STATS_MODE", "STATS_MW_TEST", "STATS_ONE_WAY_ANOVA", "STATS_T_TEST_ONE", "STATS_T_TEST_PAIRED", "STATS_T_TEST_INDEP", "STATS_T_TEST_INDEPU", "STATS_WSR_TEST", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "SUM", "VAR_POP", "VAR_SAMP", "VARIANCE"],
  // Windowing functions (minus the ones already listed in aggregates)
  window: ["FIRST_VALUE", "LAG", "LAST_VALUE", "LEAD", "NTILE", "RATIO_TO_REPORT", "ROW_NUMBER"],
  objectReference: ["DEREF", "MAKE_REF", "REF", "REFTOHEX", "VALUE"],
  model: ["CV", "ITERATION_NUMBER", "PRESENTNNV", "PRESENTV", "PREVIOUS"],
  // Parameterized data types
  // https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Data-Types.html
  dataTypes: [
    // Oracle builtin data types
    "VARCHAR2",
    "NVARCHAR2",
    "NUMBER",
    "FLOAT",
    "TIMESTAMP",
    "INTERVAL YEAR",
    "INTERVAL DAY",
    "RAW",
    "UROWID",
    "NCHAR",
    // ANSI Data Types
    "CHARACTER",
    "CHAR",
    "CHARACTER VARYING",
    "CHAR VARYING",
    "NATIONAL CHARACTER",
    "NATIONAL CHAR",
    "NATIONAL CHARACTER VARYING",
    "NATIONAL CHAR VARYING",
    "NCHAR VARYING",
    "NUMERIC",
    "DECIMAL",
    "FLOAT",
    // SQL/DS and DB2 Data Types
    "VARCHAR"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/plsql/plsql.formatter.js
var reservedSelect7 = expandPhrases(["SELECT [ALL | DISTINCT | UNIQUE]"]);
var reservedClauses7 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER [SIBLINGS] BY",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  "FOR UPDATE [OF]",
  // Data manipulation
  // - insert:
  "INSERT [INTO | ALL INTO]",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE [INTO]",
  "WHEN [NOT] MATCHED [THEN]",
  "UPDATE SET",
  // Data definition
  "CREATE [OR REPLACE] [NO FORCE | FORCE] [EDITIONING | EDITIONABLE | EDITIONABLE EDITIONING | NONEDITIONABLE] VIEW",
  "CREATE MATERIALIZED VIEW",
  "CREATE [GLOBAL TEMPORARY | PRIVATE TEMPORARY | SHARDED | DUPLICATED | IMMUTABLE BLOCKCHAIN | BLOCKCHAIN | IMMUTABLE] TABLE",
  // other
  "RETURNING"
]);
var onelineClauses7 = expandPhrases([
  // - update:
  "UPDATE [ONLY]",
  // - delete:
  "DELETE FROM [ONLY]",
  // - drop table:
  "DROP TABLE",
  // - alter table:
  "ALTER TABLE",
  "ADD",
  "DROP {COLUMN | UNUSED COLUMNS | COLUMNS CONTINUE}",
  "MODIFY",
  "RENAME TO",
  "RENAME COLUMN",
  // - truncate:
  "TRUNCATE TABLE",
  // other
  "SET SCHEMA",
  "BEGIN",
  "CONNECT BY",
  "DECLARE",
  "EXCEPT",
  "EXCEPTION",
  "LOOP",
  "START WITH"
]);
var reservedSetOperations7 = expandPhrases(["UNION [ALL]", "EXCEPT", "INTERSECT"]);
var reservedJoins7 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN",
  // non-standard joins
  "{CROSS | OUTER} APPLY"
]);
var reservedPhrases7 = expandPhrases(["ON {UPDATE | DELETE} [SET NULL]", "ON COMMIT", "{ROWS | RANGE} BETWEEN"]);
var plsql = {
  tokenizerOptions: {
    reservedSelect: reservedSelect7,
    reservedClauses: [...reservedClauses7, ...onelineClauses7],
    reservedSetOperations: reservedSetOperations7,
    reservedJoins: reservedJoins7,
    reservedPhrases: reservedPhrases7,
    supportsXor: true,
    reservedKeywords: keywords7,
    reservedFunctionNames: functions7,
    stringTypes: [{
      quote: "''-qq",
      prefixes: ["N"]
    }, {
      quote: "q''",
      prefixes: ["N"]
    }],
    // PL/SQL doesn't actually support escaping of quotes in identifiers,
    // but for the sake of simpler testing we'll support this anyway
    // as all other SQL dialects with "identifiers" do.
    identTypes: [`""-qq`],
    identChars: {
      rest: "$#"
    },
    variableTypes: [{
      regex: "&{1,2}[A-Za-z][A-Za-z0-9_$#]*"
    }],
    paramTypes: {
      numbered: [":"],
      named: [":"]
    },
    paramChars: {},
    // Empty object used on purpose to not allow $ and # chars as specified in identChars
    operators: [
      "**",
      ":=",
      "%",
      "~=",
      "^=",
      // '..', // Conflicts with float followed by dot (so "2..3" gets parsed as ["2.", ".", "3"])
      ">>",
      "<<",
      "=>",
      "@",
      "||"
    ],
    postProcess: postProcess4
  },
  formatOptions: {
    alwaysDenseOperators: ["@"],
    onelineClauses: onelineClauses7
  }
};
function postProcess4(tokens) {
  let previousReservedToken = EOF_TOKEN;
  return tokens.map((token) => {
    if (isToken.SET(token) && isToken.BY(previousReservedToken)) {
      return {
        ...token,
        type: TokenType.RESERVED_KEYWORD
      };
    }
    if (isReserved(token.type)) {
      previousReservedToken = token;
    }
    return token;
  });
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/postgresql/postgresql.functions.js
var functions8 = flatKeywordList({
  // https://www.postgresql.org/docs/14/functions.html
  //
  // https://www.postgresql.org/docs/14/functions-math.html
  math: ["ABS", "ACOS", "ACOSD", "ACOSH", "ASIN", "ASIND", "ASINH", "ATAN", "ATAN2", "ATAN2D", "ATAND", "ATANH", "CBRT", "CEIL", "CEILING", "COS", "COSD", "COSH", "COT", "COTD", "DEGREES", "DIV", "EXP", "FACTORIAL", "FLOOR", "GCD", "LCM", "LN", "LOG", "LOG10", "MIN_SCALE", "MOD", "PI", "POWER", "RADIANS", "RANDOM", "ROUND", "SCALE", "SETSEED", "SIGN", "SIN", "SIND", "SINH", "SQRT", "TAN", "TAND", "TANH", "TRIM_SCALE", "TRUNC", "WIDTH_BUCKET"],
  // https://www.postgresql.org/docs/14/functions-string.html
  string: ["ABS", "ASCII", "BIT_LENGTH", "BTRIM", "CHARACTER_LENGTH", "CHAR_LENGTH", "CHR", "CONCAT", "CONCAT_WS", "FORMAT", "INITCAP", "LEFT", "LENGTH", "LOWER", "LPAD", "LTRIM", "MD5", "NORMALIZE", "OCTET_LENGTH", "OVERLAY", "PARSE_IDENT", "PG_CLIENT_ENCODING", "POSITION", "QUOTE_IDENT", "QUOTE_LITERAL", "QUOTE_NULLABLE", "REGEXP_MATCH", "REGEXP_MATCHES", "REGEXP_REPLACE", "REGEXP_SPLIT_TO_ARRAY", "REGEXP_SPLIT_TO_TABLE", "REPEAT", "REPLACE", "REVERSE", "RIGHT", "RPAD", "RTRIM", "SPLIT_PART", "SPRINTF", "STARTS_WITH", "STRING_AGG", "STRING_TO_ARRAY", "STRING_TO_TABLE", "STRPOS", "SUBSTR", "SUBSTRING", "TO_ASCII", "TO_HEX", "TRANSLATE", "TRIM", "UNISTR", "UPPER"],
  // https://www.postgresql.org/docs/14/functions-binarystring.html
  binary: ["BIT_COUNT", "BIT_LENGTH", "BTRIM", "CONVERT", "CONVERT_FROM", "CONVERT_TO", "DECODE", "ENCODE", "GET_BIT", "GET_BYTE", "LENGTH", "LTRIM", "MD5", "OCTET_LENGTH", "OVERLAY", "POSITION", "RTRIM", "SET_BIT", "SET_BYTE", "SHA224", "SHA256", "SHA384", "SHA512", "STRING_AGG", "SUBSTR", "SUBSTRING", "TRIM"],
  // https://www.postgresql.org/docs/14/functions-bitstring.html
  bitstring: ["BIT_COUNT", "BIT_LENGTH", "GET_BIT", "LENGTH", "OCTET_LENGTH", "OVERLAY", "POSITION", "SET_BIT", "SUBSTRING"],
  // https://www.postgresql.org/docs/14/functions-matching.html
  pattern: ["REGEXP_MATCH", "REGEXP_MATCHES", "REGEXP_REPLACE", "REGEXP_SPLIT_TO_ARRAY", "REGEXP_SPLIT_TO_TABLE"],
  // https://www.postgresql.org/docs/14/functions-formatting.html
  datatype: ["TO_CHAR", "TO_DATE", "TO_NUMBER", "TO_TIMESTAMP"],
  // https://www.postgresql.org/docs/14/functions-datetime.html
  datetime: [
    // 'AGE',
    "CLOCK_TIMESTAMP",
    "CURRENT_DATE",
    "CURRENT_TIME",
    "CURRENT_TIMESTAMP",
    "DATE_BIN",
    "DATE_PART",
    "DATE_TRUNC",
    "EXTRACT",
    "ISFINITE",
    "JUSTIFY_DAYS",
    "JUSTIFY_HOURS",
    "JUSTIFY_INTERVAL",
    "LOCALTIME",
    "LOCALTIMESTAMP",
    "MAKE_DATE",
    "MAKE_INTERVAL",
    "MAKE_TIME",
    "MAKE_TIMESTAMP",
    "MAKE_TIMESTAMPTZ",
    "NOW",
    "PG_SLEEP",
    "PG_SLEEP_FOR",
    "PG_SLEEP_UNTIL",
    "STATEMENT_TIMESTAMP",
    "TIMEOFDAY",
    "TO_TIMESTAMP",
    "TRANSACTION_TIMESTAMP"
  ],
  // https://www.postgresql.org/docs/14/functions-enum.html
  enum: ["ENUM_FIRST", "ENUM_LAST", "ENUM_RANGE"],
  // https://www.postgresql.org/docs/14/functions-geometry.html
  geometry: ["AREA", "BOUND_BOX", "BOX", "CENTER", "CIRCLE", "DIAGONAL", "DIAMETER", "HEIGHT", "ISCLOSED", "ISOPEN", "LENGTH", "LINE", "LSEG", "NPOINTS", "PATH", "PCLOSE", "POINT", "POLYGON", "POPEN", "RADIUS", "SLOPE", "WIDTH"],
  // https://www.postgresql.org/docs/14/functions-net.html
  network: ["ABBREV", "BROADCAST", "FAMILY", "HOST", "HOSTMASK", "INET_MERGE", "INET_SAME_FAMILY", "MACADDR8_SET7BIT", "MASKLEN", "NETMASK", "NETWORK", "SET_MASKLEN", "TEXT", "TRUNC"],
  // https://www.postgresql.org/docs/14/functions-textsearch.html
  textsearch: ["ARRAY_TO_TSVECTOR", "GET_CURRENT_TS_CONFIG", "JSONB_TO_TSVECTOR", "JSON_TO_TSVECTOR", "LENGTH", "NUMNODE", "PHRASETO_TSQUERY", "PLAINTO_TSQUERY", "QUERYTREE", "SETWEIGHT", "STRIP", "TO_TSQUERY", "TO_TSVECTOR", "TSQUERY_PHRASE", "TSVECTOR_TO_ARRAY", "TS_DEBUG", "TS_DELETE", "TS_FILTER", "TS_HEADLINE", "TS_LEXIZE", "TS_PARSE", "TS_RANK", "TS_RANK_CD", "TS_REWRITE", "TS_STAT", "TS_TOKEN_TYPE", "WEBSEARCH_TO_TSQUERY"],
  // https://www.postgresql.org/docs/14/functions-uuid.html
  uuid: ["UUID"],
  // https://www.postgresql.org/docs/14/functions-xml.html
  xml: ["CURSOR_TO_XML", "CURSOR_TO_XMLSCHEMA", "DATABASE_TO_XML", "DATABASE_TO_XMLSCHEMA", "DATABASE_TO_XML_AND_XMLSCHEMA", "NEXTVAL", "QUERY_TO_XML", "QUERY_TO_XMLSCHEMA", "QUERY_TO_XML_AND_XMLSCHEMA", "SCHEMA_TO_XML", "SCHEMA_TO_XMLSCHEMA", "SCHEMA_TO_XML_AND_XMLSCHEMA", "STRING", "TABLE_TO_XML", "TABLE_TO_XMLSCHEMA", "TABLE_TO_XML_AND_XMLSCHEMA", "XMLAGG", "XMLCOMMENT", "XMLCONCAT", "XMLELEMENT", "XMLEXISTS", "XMLFOREST", "XMLPARSE", "XMLPI", "XMLROOT", "XMLSERIALIZE", "XMLTABLE", "XML_IS_WELL_FORMED", "XML_IS_WELL_FORMED_CONTENT", "XML_IS_WELL_FORMED_DOCUMENT", "XPATH", "XPATH_EXISTS"],
  // https://www.postgresql.org/docs/14/functions-json.html
  json: ["ARRAY_TO_JSON", "JSONB_AGG", "JSONB_ARRAY_ELEMENTS", "JSONB_ARRAY_ELEMENTS_TEXT", "JSONB_ARRAY_LENGTH", "JSONB_BUILD_ARRAY", "JSONB_BUILD_OBJECT", "JSONB_EACH", "JSONB_EACH_TEXT", "JSONB_EXTRACT_PATH", "JSONB_EXTRACT_PATH_TEXT", "JSONB_INSERT", "JSONB_OBJECT", "JSONB_OBJECT_AGG", "JSONB_OBJECT_KEYS", "JSONB_PATH_EXISTS", "JSONB_PATH_EXISTS_TZ", "JSONB_PATH_MATCH", "JSONB_PATH_MATCH_TZ", "JSONB_PATH_QUERY", "JSONB_PATH_QUERY_ARRAY", "JSONB_PATH_QUERY_ARRAY_TZ", "JSONB_PATH_QUERY_FIRST", "JSONB_PATH_QUERY_FIRST_TZ", "JSONB_PATH_QUERY_TZ", "JSONB_POPULATE_RECORD", "JSONB_POPULATE_RECORDSET", "JSONB_PRETTY", "JSONB_SET", "JSONB_SET_LAX", "JSONB_STRIP_NULLS", "JSONB_TO_RECORD", "JSONB_TO_RECORDSET", "JSONB_TYPEOF", "JSON_AGG", "JSON_ARRAY_ELEMENTS", "JSON_ARRAY_ELEMENTS_TEXT", "JSON_ARRAY_LENGTH", "JSON_BUILD_ARRAY", "JSON_BUILD_OBJECT", "JSON_EACH", "JSON_EACH_TEXT", "JSON_EXTRACT_PATH", "JSON_EXTRACT_PATH_TEXT", "JSON_OBJECT", "JSON_OBJECT_AGG", "JSON_OBJECT_KEYS", "JSON_POPULATE_RECORD", "JSON_POPULATE_RECORDSET", "JSON_STRIP_NULLS", "JSON_TO_RECORD", "JSON_TO_RECORDSET", "JSON_TYPEOF", "ROW_TO_JSON", "TO_JSON", "TO_JSONB", "TO_TIMESTAMP"],
  // https://www.postgresql.org/docs/14/functions-sequence.html
  sequence: ["CURRVAL", "LASTVAL", "NEXTVAL", "SETVAL"],
  // https://www.postgresql.org/docs/14/functions-conditional.html
  conditional: [
    // 'CASE',
    "COALESCE",
    "GREATEST",
    "LEAST",
    "NULLIF"
  ],
  // https://www.postgresql.org/docs/14/functions-array.html
  array: ["ARRAY_AGG", "ARRAY_APPEND", "ARRAY_CAT", "ARRAY_DIMS", "ARRAY_FILL", "ARRAY_LENGTH", "ARRAY_LOWER", "ARRAY_NDIMS", "ARRAY_POSITION", "ARRAY_POSITIONS", "ARRAY_PREPEND", "ARRAY_REMOVE", "ARRAY_REPLACE", "ARRAY_TO_STRING", "ARRAY_UPPER", "CARDINALITY", "STRING_TO_ARRAY", "TRIM_ARRAY", "UNNEST"],
  // https://www.postgresql.org/docs/14/functions-range.html
  range: ["ISEMPTY", "LOWER", "LOWER_INC", "LOWER_INF", "MULTIRANGE", "RANGE_MERGE", "UPPER", "UPPER_INC", "UPPER_INF"],
  // https://www.postgresql.org/docs/14/functions-aggregate.html
  aggregate: [
    // 'ANY',
    "ARRAY_AGG",
    "AVG",
    "BIT_AND",
    "BIT_OR",
    "BIT_XOR",
    "BOOL_AND",
    "BOOL_OR",
    "COALESCE",
    "CORR",
    "COUNT",
    "COVAR_POP",
    "COVAR_SAMP",
    "CUME_DIST",
    "DENSE_RANK",
    "EVERY",
    "GROUPING",
    "JSONB_AGG",
    "JSONB_OBJECT_AGG",
    "JSON_AGG",
    "JSON_OBJECT_AGG",
    "MAX",
    "MIN",
    "MODE",
    "PERCENTILE_CONT",
    "PERCENTILE_DISC",
    "PERCENT_RANK",
    "RANGE_AGG",
    "RANGE_INTERSECT_AGG",
    "RANK",
    "REGR_AVGX",
    "REGR_AVGY",
    "REGR_COUNT",
    "REGR_INTERCEPT",
    "REGR_R2",
    "REGR_SLOPE",
    "REGR_SXX",
    "REGR_SXY",
    "REGR_SYY",
    // 'SOME',
    "STDDEV",
    "STDDEV_POP",
    "STDDEV_SAMP",
    "STRING_AGG",
    "SUM",
    "TO_JSON",
    "TO_JSONB",
    "VARIANCE",
    "VAR_POP",
    "VAR_SAMP",
    "XMLAGG"
  ],
  // https://www.postgresql.org/docs/14/functions-window.html
  window: ["CUME_DIST", "DENSE_RANK", "FIRST_VALUE", "LAG", "LAST_VALUE", "LEAD", "NTH_VALUE", "NTILE", "PERCENT_RANK", "RANK", "ROW_NUMBER"],
  // https://www.postgresql.org/docs/14/functions-srf.html
  set: ["GENERATE_SERIES", "GENERATE_SUBSCRIPTS"],
  // https://www.postgresql.org/docs/14/functions-info.html
  sysInfo: ["ACLDEFAULT", "ACLEXPLODE", "COL_DESCRIPTION", "CURRENT_CATALOG", "CURRENT_DATABASE", "CURRENT_QUERY", "CURRENT_ROLE", "CURRENT_SCHEMA", "CURRENT_SCHEMAS", "CURRENT_USER", "FORMAT_TYPE", "HAS_ANY_COLUMN_PRIVILEGE", "HAS_COLUMN_PRIVILEGE", "HAS_DATABASE_PRIVILEGE", "HAS_FOREIGN_DATA_WRAPPER_PRIVILEGE", "HAS_FUNCTION_PRIVILEGE", "HAS_LANGUAGE_PRIVILEGE", "HAS_SCHEMA_PRIVILEGE", "HAS_SEQUENCE_PRIVILEGE", "HAS_SERVER_PRIVILEGE", "HAS_TABLESPACE_PRIVILEGE", "HAS_TABLE_PRIVILEGE", "HAS_TYPE_PRIVILEGE", "INET_CLIENT_ADDR", "INET_CLIENT_PORT", "INET_SERVER_ADDR", "INET_SERVER_PORT", "MAKEACLITEM", "OBJ_DESCRIPTION", "PG_BACKEND_PID", "PG_BLOCKING_PIDS", "PG_COLLATION_IS_VISIBLE", "PG_CONF_LOAD_TIME", "PG_CONTROL_CHECKPOINT", "PG_CONTROL_INIT", "PG_CONTROL_SYSTEM", "PG_CONVERSION_IS_VISIBLE", "PG_CURRENT_LOGFILE", "PG_CURRENT_SNAPSHOT", "PG_CURRENT_XACT_ID", "PG_CURRENT_XACT_ID_IF_ASSIGNED", "PG_DESCRIBE_OBJECT", "PG_FUNCTION_IS_VISIBLE", "PG_GET_CATALOG_FOREIGN_KEYS", "PG_GET_CONSTRAINTDEF", "PG_GET_EXPR", "PG_GET_FUNCTIONDEF", "PG_GET_FUNCTION_ARGUMENTS", "PG_GET_FUNCTION_IDENTITY_ARGUMENTS", "PG_GET_FUNCTION_RESULT", "PG_GET_INDEXDEF", "PG_GET_KEYWORDS", "PG_GET_OBJECT_ADDRESS", "PG_GET_OWNED_SEQUENCE", "PG_GET_RULEDEF", "PG_GET_SERIAL_SEQUENCE", "PG_GET_STATISTICSOBJDEF", "PG_GET_TRIGGERDEF", "PG_GET_USERBYID", "PG_GET_VIEWDEF", "PG_HAS_ROLE", "PG_IDENTIFY_OBJECT", "PG_IDENTIFY_OBJECT_AS_ADDRESS", "PG_INDEXAM_HAS_PROPERTY", "PG_INDEX_COLUMN_HAS_PROPERTY", "PG_INDEX_HAS_PROPERTY", "PG_IS_OTHER_TEMP_SCHEMA", "PG_JIT_AVAILABLE", "PG_LAST_COMMITTED_XACT", "PG_LISTENING_CHANNELS", "PG_MY_TEMP_SCHEMA", "PG_NOTIFICATION_QUEUE_USAGE", "PG_OPCLASS_IS_VISIBLE", "PG_OPERATOR_IS_VISIBLE", "PG_OPFAMILY_IS_VISIBLE", "PG_OPTIONS_TO_TABLE", "PG_POSTMASTER_START_TIME", "PG_SAFE_SNAPSHOT_BLOCKING_PIDS", "PG_SNAPSHOT_XIP", "PG_SNAPSHOT_XMAX", "PG_SNAPSHOT_XMIN", "PG_STATISTICS_OBJ_IS_VISIBLE", "PG_TABLESPACE_DATABASES", "PG_TABLESPACE_LOCATION", "PG_TABLE_IS_VISIBLE", "PG_TRIGGER_DEPTH", "PG_TS_CONFIG_IS_VISIBLE", "PG_TS_DICT_IS_VISIBLE", "PG_TS_PARSER_IS_VISIBLE", "PG_TS_TEMPLATE_IS_VISIBLE", "PG_TYPEOF", "PG_TYPE_IS_VISIBLE", "PG_VISIBLE_IN_SNAPSHOT", "PG_XACT_COMMIT_TIMESTAMP", "PG_XACT_COMMIT_TIMESTAMP_ORIGIN", "PG_XACT_STATUS", "PQSERVERVERSION", "ROW_SECURITY_ACTIVE", "SESSION_USER", "SHOBJ_DESCRIPTION", "TO_REGCLASS", "TO_REGCOLLATION", "TO_REGNAMESPACE", "TO_REGOPER", "TO_REGOPERATOR", "TO_REGPROC", "TO_REGPROCEDURE", "TO_REGROLE", "TO_REGTYPE", "TXID_CURRENT", "TXID_CURRENT_IF_ASSIGNED", "TXID_CURRENT_SNAPSHOT", "TXID_SNAPSHOT_XIP", "TXID_SNAPSHOT_XMAX", "TXID_SNAPSHOT_XMIN", "TXID_STATUS", "TXID_VISIBLE_IN_SNAPSHOT", "USER", "VERSION"],
  // https://www.postgresql.org/docs/14/functions-admin.html
  sysAdmin: ["BRIN_DESUMMARIZE_RANGE", "BRIN_SUMMARIZE_NEW_VALUES", "BRIN_SUMMARIZE_RANGE", "CONVERT_FROM", "CURRENT_SETTING", "GIN_CLEAN_PENDING_LIST", "PG_ADVISORY_LOCK", "PG_ADVISORY_LOCK_SHARED", "PG_ADVISORY_UNLOCK", "PG_ADVISORY_UNLOCK_ALL", "PG_ADVISORY_UNLOCK_SHARED", "PG_ADVISORY_XACT_LOCK", "PG_ADVISORY_XACT_LOCK_SHARED", "PG_BACKUP_START_TIME", "PG_CANCEL_BACKEND", "PG_COLLATION_ACTUAL_VERSION", "PG_COLUMN_COMPRESSION", "PG_COLUMN_SIZE", "PG_COPY_LOGICAL_REPLICATION_SLOT", "PG_COPY_PHYSICAL_REPLICATION_SLOT", "PG_CREATE_LOGICAL_REPLICATION_SLOT", "PG_CREATE_PHYSICAL_REPLICATION_SLOT", "PG_CREATE_RESTORE_POINT", "PG_CURRENT_WAL_FLUSH_LSN", "PG_CURRENT_WAL_INSERT_LSN", "PG_CURRENT_WAL_LSN", "PG_DATABASE_SIZE", "PG_DROP_REPLICATION_SLOT", "PG_EXPORT_SNAPSHOT", "PG_FILENODE_RELATION", "PG_GET_WAL_REPLAY_PAUSE_STATE", "PG_IMPORT_SYSTEM_COLLATIONS", "PG_INDEXES_SIZE", "PG_IS_IN_BACKUP", "PG_IS_IN_RECOVERY", "PG_IS_WAL_REPLAY_PAUSED", "PG_LAST_WAL_RECEIVE_LSN", "PG_LAST_WAL_REPLAY_LSN", "PG_LAST_XACT_REPLAY_TIMESTAMP", "PG_LOGICAL_EMIT_MESSAGE", "PG_LOGICAL_SLOT_GET_BINARY_CHANGES", "PG_LOGICAL_SLOT_GET_CHANGES", "PG_LOGICAL_SLOT_PEEK_BINARY_CHANGES", "PG_LOGICAL_SLOT_PEEK_CHANGES", "PG_LOG_BACKEND_MEMORY_CONTEXTS", "PG_LS_ARCHIVE_STATUSDIR", "PG_LS_DIR", "PG_LS_LOGDIR", "PG_LS_TMPDIR", "PG_LS_WALDIR", "PG_PARTITION_ANCESTORS", "PG_PARTITION_ROOT", "PG_PARTITION_TREE", "PG_PROMOTE", "PG_READ_BINARY_FILE", "PG_READ_FILE", "PG_RELATION_FILENODE", "PG_RELATION_FILEPATH", "PG_RELATION_SIZE", "PG_RELOAD_CONF", "PG_REPLICATION_ORIGIN_ADVANCE", "PG_REPLICATION_ORIGIN_CREATE", "PG_REPLICATION_ORIGIN_DROP", "PG_REPLICATION_ORIGIN_OID", "PG_REPLICATION_ORIGIN_PROGRESS", "PG_REPLICATION_ORIGIN_SESSION_IS_SETUP", "PG_REPLICATION_ORIGIN_SESSION_PROGRESS", "PG_REPLICATION_ORIGIN_SESSION_RESET", "PG_REPLICATION_ORIGIN_SESSION_SETUP", "PG_REPLICATION_ORIGIN_XACT_RESET", "PG_REPLICATION_ORIGIN_XACT_SETUP", "PG_REPLICATION_SLOT_ADVANCE", "PG_ROTATE_LOGFILE", "PG_SIZE_BYTES", "PG_SIZE_PRETTY", "PG_START_BACKUP", "PG_STAT_FILE", "PG_STOP_BACKUP", "PG_SWITCH_WAL", "PG_TABLESPACE_SIZE", "PG_TABLE_SIZE", "PG_TERMINATE_BACKEND", "PG_TOTAL_RELATION_SIZE", "PG_TRY_ADVISORY_LOCK", "PG_TRY_ADVISORY_LOCK_SHARED", "PG_TRY_ADVISORY_XACT_LOCK", "PG_TRY_ADVISORY_XACT_LOCK_SHARED", "PG_WALFILE_NAME", "PG_WALFILE_NAME_OFFSET", "PG_WAL_LSN_DIFF", "PG_WAL_REPLAY_PAUSE", "PG_WAL_REPLAY_RESUME", "SET_CONFIG"],
  // https://www.postgresql.org/docs/14/functions-trigger.html
  trigger: ["SUPPRESS_REDUNDANT_UPDATES_TRIGGER", "TSVECTOR_UPDATE_TRIGGER", "TSVECTOR_UPDATE_TRIGGER_COLUMN"],
  // https://www.postgresql.org/docs/14/functions-event-triggers.html
  eventTrigger: ["PG_EVENT_TRIGGER_DDL_COMMANDS", "PG_EVENT_TRIGGER_DROPPED_OBJECTS", "PG_EVENT_TRIGGER_TABLE_REWRITE_OID", "PG_EVENT_TRIGGER_TABLE_REWRITE_REASON", "PG_GET_OBJECT_ADDRESS"],
  // https://www.postgresql.org/docs/14/functions-statistics.html
  stats: ["PG_MCV_LIST_ITEMS"],
  cast: ["CAST"],
  // Parameterized data types
  // https://www.postgresql.org/docs/current/datatype.html
  dataTypes: ["BIT", "BIT VARYING", "CHARACTER", "CHARACTER VARYING", "VARCHAR", "CHAR", "DECIMAL", "NUMERIC", "TIME", "TIMESTAMP", "ENUM"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/postgresql/postgresql.keywords.js
var keywords8 = flatKeywordList({
  // https://www.postgresql.org/docs/14/sql-keywords-appendix.html
  all: [
    "ABORT",
    "ABSOLUTE",
    "ACCESS",
    "ACTION",
    "ADD",
    "ADMIN",
    "AFTER",
    "AGGREGATE",
    "ALL",
    // reserved
    "ALSO",
    "ALTER",
    "ALWAYS",
    "ANALYSE",
    // reserved
    "ANALYZE",
    // reserved
    "AND",
    // reserved
    "ANY",
    // reserved
    "ARRAY",
    // reserved, requires AS
    "AS",
    // reserved, requires AS
    "ASC",
    // reserved
    "ASENSITIVE",
    "ASSERTION",
    "ASSIGNMENT",
    "ASYMMETRIC",
    // reserved
    "AT",
    "ATOMIC",
    "ATTACH",
    "ATTRIBUTE",
    "AUTHORIZATION",
    // reserved (can be function or type)
    "BACKWARD",
    "BEFORE",
    "BEGIN",
    "BETWEEN",
    // (cannot be function or type)
    "BIGINT",
    // (cannot be function or type)
    "BINARY",
    // reserved (can be function or type)
    "BIT",
    // (cannot be function or type)
    "BOOLEAN",
    // (cannot be function or type)
    "BOTH",
    // reserved
    "BREADTH",
    "BY",
    "CACHE",
    "CALL",
    "CALLED",
    "CASCADE",
    "CASCADED",
    "CASE",
    // reserved
    "CAST",
    // reserved
    "CATALOG",
    "CHAIN",
    "CHAR",
    // (cannot be function or type), requires AS
    "CHARACTER",
    // (cannot be function or type), requires AS
    "CHARACTERISTICS",
    "CHECK",
    // reserved
    "CHECKPOINT",
    "CLASS",
    "CLOSE",
    "CLUSTER",
    "COALESCE",
    // (cannot be function or type)
    "COLLATE",
    // reserved
    "COLLATION",
    // reserved (can be function or type)
    "COLUMN",
    // reserved
    "COLUMNS",
    "COMMENT",
    "COMMENTS",
    "COMMIT",
    "COMMITTED",
    "COMPRESSION",
    "CONCURRENTLY",
    // reserved (can be function or type)
    "CONFIGURATION",
    "CONFLICT",
    "CONNECTION",
    "CONSTRAINT",
    // reserved
    "CONSTRAINTS",
    "CONTENT",
    "CONTINUE",
    "CONVERSION",
    "COPY",
    "COST",
    "CREATE",
    // reserved, requires AS
    "CROSS",
    // reserved (can be function or type)
    "CSV",
    "CUBE",
    "CURRENT",
    "CURRENT_CATALOG",
    // reserved
    "CURRENT_DATE",
    // reserved
    "CURRENT_ROLE",
    // reserved
    "CURRENT_SCHEMA",
    // reserved (can be function or type)
    "CURRENT_TIME",
    // reserved
    "CURRENT_TIMESTAMP",
    // reserved
    "CURRENT_USER",
    // reserved
    "CURSOR",
    "CYCLE",
    "DATA",
    "DATABASE",
    "DAY",
    // requires AS
    "DEALLOCATE",
    "DEC",
    // (cannot be function or type)
    "DECIMAL",
    // (cannot be function or type)
    "DECLARE",
    "DEFAULT",
    // reserved
    "DEFAULTS",
    "DEFERRABLE",
    // reserved
    "DEFERRED",
    "DEFINER",
    "DELETE",
    "DELIMITER",
    "DELIMITERS",
    "DEPENDS",
    "DEPTH",
    "DESC",
    // reserved
    "DETACH",
    "DICTIONARY",
    "DISABLE",
    "DISCARD",
    "DISTINCT",
    // reserved
    "DO",
    // reserved
    "DOCUMENT",
    "DOMAIN",
    "DOUBLE",
    "DROP",
    "EACH",
    "ELSE",
    // reserved
    "ENABLE",
    "ENCODING",
    "ENCRYPTED",
    "END",
    // reserved
    "ENUM",
    "ESCAPE",
    "EVENT",
    "EXCEPT",
    // reserved, requires AS
    "EXCLUDE",
    "EXCLUDING",
    "EXCLUSIVE",
    "EXECUTE",
    "EXISTS",
    // (cannot be function or type)
    "EXPLAIN",
    "EXPRESSION",
    "EXTENSION",
    "EXTERNAL",
    "EXTRACT",
    // (cannot be function or type)
    "FALSE",
    // reserved
    "FAMILY",
    "FETCH",
    // reserved, requires AS
    "FILTER",
    // requires AS
    "FINALIZE",
    "FIRST",
    "FLOAT",
    // (cannot be function or type)
    "FOLLOWING",
    "FOR",
    // reserved, requires AS
    "FORCE",
    "FOREIGN",
    // reserved
    "FORWARD",
    "FREEZE",
    // reserved (can be function or type)
    "FROM",
    // reserved, requires AS
    "FULL",
    // reserved (can be function or type)
    "FUNCTION",
    "FUNCTIONS",
    "GENERATED",
    "GLOBAL",
    "GRANT",
    // reserved, requires AS
    "GRANTED",
    "GREATEST",
    // (cannot be function or type)
    "GROUP",
    // reserved, requires AS
    "GROUPING",
    // (cannot be function or type)
    "GROUPS",
    "HANDLER",
    "HAVING",
    // reserved, requires AS
    "HEADER",
    "HOLD",
    "HOUR",
    // requires AS
    "IDENTITY",
    "IF",
    "ILIKE",
    // reserved (can be function or type)
    "IMMEDIATE",
    "IMMUTABLE",
    "IMPLICIT",
    "IMPORT",
    "IN",
    // reserved
    "INCLUDE",
    "INCLUDING",
    "INCREMENT",
    "INDEX",
    "INDEXES",
    "INHERIT",
    "INHERITS",
    "INITIALLY",
    // reserved
    "INLINE",
    "INNER",
    // reserved (can be function or type)
    "INOUT",
    // (cannot be function or type)
    "INPUT",
    "INSENSITIVE",
    "INSERT",
    "INSTEAD",
    "INT",
    // (cannot be function or type)
    "INTEGER",
    // (cannot be function or type)
    "INTERSECT",
    // reserved, requires AS
    "INTERVAL",
    // (cannot be function or type)
    "INTO",
    // reserved, requires AS
    "INVOKER",
    "IS",
    // reserved (can be function or type)
    "ISNULL",
    // reserved (can be function or type), requires AS
    "ISOLATION",
    "JOIN",
    // reserved (can be function or type)
    "KEY",
    "LABEL",
    "LANGUAGE",
    "LARGE",
    "LAST",
    "LATERAL",
    // reserved
    "LEADING",
    // reserved
    "LEAKPROOF",
    "LEAST",
    // (cannot be function or type)
    "LEFT",
    // reserved (can be function or type)
    "LEVEL",
    "LIKE",
    // reserved (can be function or type)
    "LIMIT",
    // reserved, requires AS
    "LISTEN",
    "LOAD",
    "LOCAL",
    "LOCALTIME",
    // reserved
    "LOCALTIMESTAMP",
    // reserved
    "LOCATION",
    "LOCK",
    "LOCKED",
    "LOGGED",
    "MAPPING",
    "MATCH",
    "MATERIALIZED",
    "MAXVALUE",
    "METHOD",
    "MINUTE",
    // requires AS
    "MINVALUE",
    "MODE",
    "MONTH",
    // requires AS
    "MOVE",
    "NAME",
    "NAMES",
    "NATIONAL",
    // (cannot be function or type)
    "NATURAL",
    // reserved (can be function or type)
    "NCHAR",
    // (cannot be function or type)
    "NEW",
    "NEXT",
    "NFC",
    "NFD",
    "NFKC",
    "NFKD",
    "NO",
    "NONE",
    // (cannot be function or type)
    "NORMALIZE",
    // (cannot be function or type)
    "NORMALIZED",
    "NOT",
    // reserved
    "NOTHING",
    "NOTIFY",
    "NOTNULL",
    // reserved (can be function or type), requires AS
    "NOWAIT",
    "NULL",
    // reserved
    "NULLIF",
    // (cannot be function or type)
    "NULLS",
    "NUMERIC",
    // (cannot be function or type)
    "OBJECT",
    "OF",
    "OFF",
    "OFFSET",
    // reserved, requires AS
    "OIDS",
    "OLD",
    "ON",
    // reserved, requires AS
    "ONLY",
    // reserved
    "OPERATOR",
    "OPTION",
    "OPTIONS",
    "OR",
    // reserved
    "ORDER",
    // reserved, requires AS
    "ORDINALITY",
    "OTHERS",
    "OUT",
    // (cannot be function or type)
    "OUTER",
    // reserved (can be function or type)
    "OVER",
    // requires AS
    "OVERLAPS",
    // reserved (can be function or type), requires AS
    "OVERLAY",
    // (cannot be function or type)
    "OVERRIDING",
    "OWNED",
    "OWNER",
    "PARALLEL",
    "PARSER",
    "PARTIAL",
    "PARTITION",
    "PASSING",
    "PASSWORD",
    "PLACING",
    // reserved
    "PLANS",
    "POLICY",
    "POSITION",
    // (cannot be function or type)
    "PRECEDING",
    "PRECISION",
    // (cannot be function or type), requires AS
    "PREPARE",
    "PREPARED",
    "PRESERVE",
    "PRIMARY",
    // reserved
    "PRIOR",
    "PRIVILEGES",
    "PROCEDURAL",
    "PROCEDURE",
    "PROCEDURES",
    "PROGRAM",
    "PUBLICATION",
    "QUOTE",
    "RANGE",
    "READ",
    "REAL",
    // (cannot be function or type)
    "REASSIGN",
    "RECHECK",
    "RECURSIVE",
    "REF",
    "REFERENCES",
    // reserved
    "REFERENCING",
    "REFRESH",
    "REINDEX",
    "RELATIVE",
    "RELEASE",
    "RENAME",
    "REPEATABLE",
    "REPLACE",
    "REPLICA",
    "RESET",
    "RESTART",
    "RESTRICT",
    "RETURN",
    "RETURNING",
    // reserved, requires AS
    "RETURNS",
    "REVOKE",
    "RIGHT",
    // reserved (can be function or type)
    "ROLE",
    "ROLLBACK",
    "ROLLUP",
    "ROUTINE",
    "ROUTINES",
    "ROW",
    // (cannot be function or type)
    "ROWS",
    "RULE",
    "SAVEPOINT",
    "SCHEMA",
    "SCHEMAS",
    "SCROLL",
    "SEARCH",
    "SECOND",
    // requires AS
    "SECURITY",
    "SELECT",
    // reserved
    "SEQUENCE",
    "SEQUENCES",
    "SERIALIZABLE",
    "SERVER",
    "SESSION",
    "SESSION_USER",
    // reserved
    "SET",
    "SETOF",
    // (cannot be function or type)
    "SETS",
    "SHARE",
    "SHOW",
    "SIMILAR",
    // reserved (can be function or type)
    "SIMPLE",
    "SKIP",
    "SMALLINT",
    // (cannot be function or type)
    "SNAPSHOT",
    "SOME",
    // reserved
    "SQL",
    "STABLE",
    "STANDALONE",
    "START",
    "STATEMENT",
    "STATISTICS",
    "STDIN",
    "STDOUT",
    "STORAGE",
    "STORED",
    "STRICT",
    "STRIP",
    "SUBSCRIPTION",
    "SUBSTRING",
    // (cannot be function or type)
    "SUPPORT",
    "SYMMETRIC",
    // reserved
    "SYSID",
    "SYSTEM",
    "TABLE",
    // reserved
    "TABLES",
    "TABLESAMPLE",
    // reserved (can be function or type)
    "TABLESPACE",
    "TEMP",
    "TEMPLATE",
    "TEMPORARY",
    "TEXT",
    "THEN",
    // reserved
    "TIES",
    "TIME",
    // (cannot be function or type)
    "TIMESTAMP",
    // (cannot be function or type)
    "TO",
    // reserved, requires AS
    "TRAILING",
    // reserved
    "TRANSACTION",
    "TRANSFORM",
    "TREAT",
    // (cannot be function or type)
    "TRIGGER",
    "TRIM",
    // (cannot be function or type)
    "TRUE",
    // reserved
    "TRUNCATE",
    "TRUSTED",
    "TYPE",
    "TYPES",
    "UESCAPE",
    "UNBOUNDED",
    "UNCOMMITTED",
    "UNENCRYPTED",
    "UNION",
    // reserved, requires AS
    "UNIQUE",
    // reserved
    "UNKNOWN",
    "UNLISTEN",
    "UNLOGGED",
    "UNTIL",
    "UPDATE",
    "USER",
    // reserved
    "USING",
    // reserved
    "VACUUM",
    "VALID",
    "VALIDATE",
    "VALIDATOR",
    "VALUE",
    "VALUES",
    // (cannot be function or type)
    "VARCHAR",
    // (cannot be function or type)
    "VARIADIC",
    // reserved
    "VARYING",
    // requires AS
    "VERBOSE",
    // reserved (can be function or type)
    "VERSION",
    "VIEW",
    "VIEWS",
    "VOLATILE",
    "WHEN",
    // reserved
    "WHERE",
    // reserved, requires AS
    "WHITESPACE",
    "WINDOW",
    // reserved, requires AS
    "WITH",
    // reserved, requires AS
    "WITHIN",
    // requires AS
    "WITHOUT",
    // requires AS
    "WORK",
    "WRAPPER",
    "WRITE",
    "XML",
    "XMLATTRIBUTES",
    // (cannot be function or type)
    "XMLCONCAT",
    // (cannot be function or type)
    "XMLELEMENT",
    // (cannot be function or type)
    "XMLEXISTS",
    // (cannot be function or type)
    "XMLFOREST",
    // (cannot be function or type)
    "XMLNAMESPACES",
    // (cannot be function or type)
    "XMLPARSE",
    // (cannot be function or type)
    "XMLPI",
    // (cannot be function or type)
    "XMLROOT",
    // (cannot be function or type)
    "XMLSERIALIZE",
    // (cannot be function or type)
    "XMLTABLE",
    // (cannot be function or type)
    "YEAR",
    // requires AS
    "YES",
    "ZONE"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/postgresql/postgresql.formatter.js
var reservedSelect8 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses8 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY [ALL | DISTINCT]",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  "FOR {UPDATE | NO KEY UPDATE | SHARE | KEY SHARE} [OF]",
  // Data manipulation
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET",
  // Data definition
  "CREATE [OR REPLACE] [TEMP | TEMPORARY] [RECURSIVE] VIEW",
  "CREATE MATERIALIZED VIEW [IF NOT EXISTS]",
  "CREATE [GLOBAL | LOCAL] [TEMPORARY | TEMP | UNLOGGED] TABLE [IF NOT EXISTS]",
  // other
  "RETURNING"
]);
var onelineClauses8 = expandPhrases([
  // - update:
  "UPDATE [ONLY]",
  "WHERE CURRENT OF",
  // - insert:
  "ON CONFLICT",
  // - delete:
  "DELETE FROM [ONLY]",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE [IF EXISTS] [ONLY]",
  "ALTER TABLE ALL IN TABLESPACE",
  "RENAME [COLUMN]",
  "RENAME TO",
  "ADD [COLUMN] [IF NOT EXISTS]",
  "DROP [COLUMN] [IF EXISTS]",
  "ALTER [COLUMN]",
  "[SET DATA] TYPE",
  // for alter column
  "{SET | DROP} DEFAULT",
  // for alter column
  "{SET | DROP} NOT NULL",
  // for alter column
  // - truncate:
  "TRUNCATE [TABLE] [ONLY]",
  // other
  "SET SCHEMA",
  "AFTER",
  // https://www.postgresql.org/docs/14/sql-commands.html
  "ABORT",
  "ALTER AGGREGATE",
  "ALTER COLLATION",
  "ALTER CONVERSION",
  "ALTER DATABASE",
  "ALTER DEFAULT PRIVILEGES",
  "ALTER DOMAIN",
  "ALTER EVENT TRIGGER",
  "ALTER EXTENSION",
  "ALTER FOREIGN DATA WRAPPER",
  "ALTER FOREIGN TABLE",
  "ALTER FUNCTION",
  "ALTER GROUP",
  "ALTER INDEX",
  "ALTER LANGUAGE",
  "ALTER LARGE OBJECT",
  "ALTER MATERIALIZED VIEW",
  "ALTER OPERATOR",
  "ALTER OPERATOR CLASS",
  "ALTER OPERATOR FAMILY",
  "ALTER POLICY",
  "ALTER PROCEDURE",
  "ALTER PUBLICATION",
  "ALTER ROLE",
  "ALTER ROUTINE",
  "ALTER RULE",
  "ALTER SCHEMA",
  "ALTER SEQUENCE",
  "ALTER SERVER",
  "ALTER STATISTICS",
  "ALTER SUBSCRIPTION",
  "ALTER SYSTEM",
  "ALTER TABLESPACE",
  "ALTER TEXT SEARCH CONFIGURATION",
  "ALTER TEXT SEARCH DICTIONARY",
  "ALTER TEXT SEARCH PARSER",
  "ALTER TEXT SEARCH TEMPLATE",
  "ALTER TRIGGER",
  "ALTER TYPE",
  "ALTER USER",
  "ALTER USER MAPPING",
  "ALTER VIEW",
  "ANALYZE",
  "BEGIN",
  "CALL",
  "CHECKPOINT",
  "CLOSE",
  "CLUSTER",
  "COMMENT",
  "COMMIT",
  "COMMIT PREPARED",
  "COPY",
  "CREATE ACCESS METHOD",
  "CREATE AGGREGATE",
  "CREATE CAST",
  "CREATE COLLATION",
  "CREATE CONVERSION",
  "CREATE DATABASE",
  "CREATE DOMAIN",
  "CREATE EVENT TRIGGER",
  "CREATE EXTENSION",
  "CREATE FOREIGN DATA WRAPPER",
  "CREATE FOREIGN TABLE",
  "CREATE FUNCTION",
  "CREATE GROUP",
  "CREATE INDEX",
  "CREATE LANGUAGE",
  "CREATE OPERATOR",
  "CREATE OPERATOR CLASS",
  "CREATE OPERATOR FAMILY",
  "CREATE POLICY",
  "CREATE PROCEDURE",
  "CREATE PUBLICATION",
  "CREATE ROLE",
  "CREATE RULE",
  "CREATE SCHEMA",
  "CREATE SEQUENCE",
  "CREATE SERVER",
  "CREATE STATISTICS",
  "CREATE SUBSCRIPTION",
  "CREATE TABLESPACE",
  "CREATE TEXT SEARCH CONFIGURATION",
  "CREATE TEXT SEARCH DICTIONARY",
  "CREATE TEXT SEARCH PARSER",
  "CREATE TEXT SEARCH TEMPLATE",
  "CREATE TRANSFORM",
  "CREATE TRIGGER",
  "CREATE TYPE",
  "CREATE USER",
  "CREATE USER MAPPING",
  "DEALLOCATE",
  "DECLARE",
  "DISCARD",
  "DROP ACCESS METHOD",
  "DROP AGGREGATE",
  "DROP CAST",
  "DROP COLLATION",
  "DROP CONVERSION",
  "DROP DATABASE",
  "DROP DOMAIN",
  "DROP EVENT TRIGGER",
  "DROP EXTENSION",
  "DROP FOREIGN DATA WRAPPER",
  "DROP FOREIGN TABLE",
  "DROP FUNCTION",
  "DROP GROUP",
  "DROP INDEX",
  "DROP LANGUAGE",
  "DROP MATERIALIZED VIEW",
  "DROP OPERATOR",
  "DROP OPERATOR CLASS",
  "DROP OPERATOR FAMILY",
  "DROP OWNED",
  "DROP POLICY",
  "DROP PROCEDURE",
  "DROP PUBLICATION",
  "DROP ROLE",
  "DROP ROUTINE",
  "DROP RULE",
  "DROP SCHEMA",
  "DROP SEQUENCE",
  "DROP SERVER",
  "DROP STATISTICS",
  "DROP SUBSCRIPTION",
  "DROP TABLESPACE",
  "DROP TEXT SEARCH CONFIGURATION",
  "DROP TEXT SEARCH DICTIONARY",
  "DROP TEXT SEARCH PARSER",
  "DROP TEXT SEARCH TEMPLATE",
  "DROP TRANSFORM",
  "DROP TRIGGER",
  "DROP TYPE",
  "DROP USER",
  "DROP USER MAPPING",
  "DROP VIEW",
  "EXECUTE",
  "EXPLAIN",
  "FETCH",
  "GRANT",
  "IMPORT FOREIGN SCHEMA",
  "LISTEN",
  "LOAD",
  "LOCK",
  "MOVE",
  "NOTIFY",
  "PREPARE",
  "PREPARE TRANSACTION",
  "REASSIGN OWNED",
  "REFRESH MATERIALIZED VIEW",
  "REINDEX",
  "RELEASE SAVEPOINT",
  "RESET",
  "REVOKE",
  "ROLLBACK",
  "ROLLBACK PREPARED",
  "ROLLBACK TO SAVEPOINT",
  "SAVEPOINT",
  "SECURITY LABEL",
  "SELECT INTO",
  "SET CONSTRAINTS",
  "SET ROLE",
  "SET SESSION AUTHORIZATION",
  "SET TRANSACTION",
  "SHOW",
  "START TRANSACTION",
  "UNLISTEN",
  "VACUUM"
]);
var reservedSetOperations8 = expandPhrases(["UNION [ALL | DISTINCT]", "EXCEPT [ALL | DISTINCT]", "INTERSECT [ALL | DISTINCT]"]);
var reservedJoins8 = expandPhrases(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"]);
var reservedPhrases8 = expandPhrases([
  "ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]",
  "{ROWS | RANGE | GROUPS} BETWEEN",
  // https://www.postgresql.org/docs/current/datatype-datetime.html
  "{TIMESTAMP | TIME} {WITH | WITHOUT} TIME ZONE",
  // comparison operator
  "IS [NOT] DISTINCT FROM"
]);
var postgresql = {
  tokenizerOptions: {
    reservedSelect: reservedSelect8,
    reservedClauses: [...reservedClauses8, ...onelineClauses8],
    reservedSetOperations: reservedSetOperations8,
    reservedJoins: reservedJoins8,
    reservedPhrases: reservedPhrases8,
    reservedKeywords: keywords8,
    reservedFunctionNames: functions8,
    nestedBlockComments: true,
    extraParens: ["[]"],
    stringTypes: ["$$", {
      quote: "''-qq",
      prefixes: ["U&"]
    }, {
      quote: "''-bs",
      prefixes: ["E"],
      requirePrefix: true
    }, {
      quote: "''-raw",
      prefixes: ["B", "X"],
      requirePrefix: true
    }],
    identTypes: [{
      quote: '""-qq',
      prefixes: ["U&"]
    }],
    identChars: {
      rest: "$"
    },
    paramTypes: {
      numbered: ["$"]
    },
    operators: [
      // Arithmetic
      "%",
      "^",
      "|/",
      "||/",
      "@",
      // Assignment
      ":=",
      // Bitwise
      "&",
      "|",
      "#",
      "~",
      "<<",
      ">>",
      // Byte comparison
      "~>~",
      "~<~",
      "~>=~",
      "~<=~",
      // Geometric
      "@-@",
      "@@",
      "##",
      "<->",
      "&&",
      "&<",
      "&>",
      "<<|",
      "&<|",
      "|>>",
      "|&>",
      "<^",
      "^>",
      "?#",
      "?-",
      "?|",
      "?-|",
      "?||",
      "@>",
      "<@",
      "~=",
      // JSON
      "?",
      "@?",
      "?&",
      "->",
      "->>",
      "#>",
      "#>>",
      "#-",
      // Named function params
      "=>",
      // Network address
      ">>=",
      "<<=",
      // Pattern matching
      "~~",
      "~~*",
      "!~~",
      "!~~*",
      // POSIX RegExp
      "~",
      "~*",
      "!~",
      "!~*",
      // Range/multirange
      "-|-",
      // String concatenation
      "||",
      // Text search
      "@@@",
      "!!",
      // Trigram/trigraph
      "<%",
      "%>",
      "<<%",
      "%>>",
      "<<->",
      "<->>",
      "<<<->",
      "<->>>",
      // Type cast
      "::"
    ]
  },
  formatOptions: {
    alwaysDenseOperators: ["::"],
    onelineClauses: onelineClauses8
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/redshift/redshift.functions.js
var functions9 = flatKeywordList({
  // https://docs.aws.amazon.com/redshift/latest/dg/c_Aggregate_Functions.html
  aggregate: ["ANY_VALUE", "APPROXIMATE PERCENTILE_DISC", "AVG", "COUNT", "LISTAGG", "MAX", "MEDIAN", "MIN", "PERCENTILE_CONT", "STDDEV_SAMP", "STDDEV_POP", "SUM", "VAR_SAMP", "VAR_POP"],
  // https://docs.aws.amazon.com/redshift/latest/dg/c_Array_Functions.html
  array: ["array", "array_concat", "array_flatten", "get_array_length", "split_to_array", "subarray"],
  // https://docs.aws.amazon.com/redshift/latest/dg/c_bitwise_aggregate_functions.html
  bitwise: ["BIT_AND", "BIT_OR", "BOOL_AND", "BOOL_OR"],
  // https://docs.aws.amazon.com/redshift/latest/dg/c_conditional_expressions.html
  conditional: ["COALESCE", "DECODE", "GREATEST", "LEAST", "NVL", "NVL2", "NULLIF"],
  // https://docs.aws.amazon.com/redshift/latest/dg/Date_functions_header.html
  dateTime: ["ADD_MONTHS", "AT TIME ZONE", "CONVERT_TIMEZONE", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "DATE_CMP", "DATE_CMP_TIMESTAMP", "DATE_CMP_TIMESTAMPTZ", "DATE_PART_YEAR", "DATEADD", "DATEDIFF", "DATE_PART", "DATE_TRUNC", "EXTRACT", "GETDATE", "INTERVAL_CMP", "LAST_DAY", "MONTHS_BETWEEN", "NEXT_DAY", "SYSDATE", "TIMEOFDAY", "TIMESTAMP_CMP", "TIMESTAMP_CMP_DATE", "TIMESTAMP_CMP_TIMESTAMPTZ", "TIMESTAMPTZ_CMP", "TIMESTAMPTZ_CMP_DATE", "TIMESTAMPTZ_CMP_TIMESTAMP", "TIMEZONE", "TO_TIMESTAMP", "TRUNC"],
  // https://docs.aws.amazon.com/redshift/latest/dg/geospatial-functions.html
  spatial: ["AddBBox", "DropBBox", "GeometryType", "ST_AddPoint", "ST_Angle", "ST_Area", "ST_AsBinary", "ST_AsEWKB", "ST_AsEWKT", "ST_AsGeoJSON", "ST_AsText", "ST_Azimuth", "ST_Boundary", "ST_Collect", "ST_Contains", "ST_ContainsProperly", "ST_ConvexHull", "ST_CoveredBy", "ST_Covers", "ST_Crosses", "ST_Dimension", "ST_Disjoint", "ST_Distance", "ST_DistanceSphere", "ST_DWithin", "ST_EndPoint", "ST_Envelope", "ST_Equals", "ST_ExteriorRing", "ST_Force2D", "ST_Force3D", "ST_Force3DM", "ST_Force3DZ", "ST_Force4D", "ST_GeometryN", "ST_GeometryType", "ST_GeomFromEWKB", "ST_GeomFromEWKT", "ST_GeomFromText", "ST_GeomFromWKB", "ST_InteriorRingN", "ST_Intersects", "ST_IsPolygonCCW", "ST_IsPolygonCW", "ST_IsClosed", "ST_IsCollection", "ST_IsEmpty", "ST_IsSimple", "ST_IsValid", "ST_Length", "ST_LengthSphere", "ST_Length2D", "ST_LineFromMultiPoint", "ST_LineInterpolatePoint", "ST_M", "ST_MakeEnvelope", "ST_MakeLine", "ST_MakePoint", "ST_MakePolygon", "ST_MemSize", "ST_MMax", "ST_MMin", "ST_Multi", "ST_NDims", "ST_NPoints", "ST_NRings", "ST_NumGeometries", "ST_NumInteriorRings", "ST_NumPoints", "ST_Perimeter", "ST_Perimeter2D", "ST_Point", "ST_PointN", "ST_Points", "ST_Polygon", "ST_RemovePoint", "ST_Reverse", "ST_SetPoint", "ST_SetSRID", "ST_Simplify", "ST_SRID", "ST_StartPoint", "ST_Touches", "ST_Within", "ST_X", "ST_XMax", "ST_XMin", "ST_Y", "ST_YMax", "ST_YMin", "ST_Z", "ST_ZMax", "ST_ZMin", "SupportsBBox"],
  // https://docs.aws.amazon.com/redshift/latest/dg/hash-functions.html
  hash: ["CHECKSUM", "FUNC_SHA1", "FNV_HASH", "MD5", "SHA", "SHA1", "SHA2"],
  // https://docs.aws.amazon.com/redshift/latest/dg/hyperloglog-functions.html
  hyperLogLog: ["HLL", "HLL_CREATE_SKETCH", "HLL_CARDINALITY", "HLL_COMBINE"],
  // https://docs.aws.amazon.com/redshift/latest/dg/json-functions.html
  json: ["IS_VALID_JSON", "IS_VALID_JSON_ARRAY", "JSON_ARRAY_LENGTH", "JSON_EXTRACT_ARRAY_ELEMENT_TEXT", "JSON_EXTRACT_PATH_TEXT", "JSON_PARSE", "JSON_SERIALIZE"],
  // https://docs.aws.amazon.com/redshift/latest/dg/Math_functions.html
  math: ["ABS", "ACOS", "ASIN", "ATAN", "ATAN2", "CBRT", "CEILING", "CEIL", "COS", "COT", "DEGREES", "DEXP", "DLOG1", "DLOG10", "EXP", "FLOOR", "LN", "LOG", "MOD", "PI", "POWER", "RADIANS", "RANDOM", "ROUND", "SIN", "SIGN", "SQRT", "TAN", "TO_HEX", "TRUNC"],
  // https://docs.aws.amazon.com/redshift/latest/dg/ml-function.html
  machineLearning: ["EXPLAIN_MODEL"],
  // https://docs.aws.amazon.com/redshift/latest/dg/String_functions_header.html
  string: ["ASCII", "BPCHARCMP", "BTRIM", "BTTEXT_PATTERN_CMP", "CHAR_LENGTH", "CHARACTER_LENGTH", "CHARINDEX", "CHR", "COLLATE", "CONCAT", "CRC32", "DIFFERENCE", "INITCAP", "LEFT", "RIGHT", "LEN", "LENGTH", "LOWER", "LPAD", "RPAD", "LTRIM", "OCTETINDEX", "OCTET_LENGTH", "POSITION", "QUOTE_IDENT", "QUOTE_LITERAL", "REGEXP_COUNT", "REGEXP_INSTR", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REPEAT", "REPLACE", "REPLICATE", "REVERSE", "RTRIM", "SOUNDEX", "SPLIT_PART", "STRPOS", "STRTOL", "SUBSTRING", "TEXTLEN", "TRANSLATE", "TRIM", "UPPER"],
  // https://docs.aws.amazon.com/redshift/latest/dg/c_Type_Info_Functions.html
  superType: ["decimal_precision", "decimal_scale", "is_array", "is_bigint", "is_boolean", "is_char", "is_decimal", "is_float", "is_integer", "is_object", "is_scalar", "is_smallint", "is_varchar", "json_typeof"],
  // https://docs.aws.amazon.com/redshift/latest/dg/c_Window_functions.html
  window: ["AVG", "COUNT", "CUME_DIST", "DENSE_RANK", "FIRST_VALUE", "LAST_VALUE", "LAG", "LEAD", "LISTAGG", "MAX", "MEDIAN", "MIN", "NTH_VALUE", "NTILE", "PERCENT_RANK", "PERCENTILE_CONT", "PERCENTILE_DISC", "RANK", "RATIO_TO_REPORT", "ROW_NUMBER", "STDDEV_SAMP", "STDDEV_POP", "SUM", "VAR_SAMP", "VAR_POP"],
  // https://docs.aws.amazon.com/redshift/latest/dg/r_Data_type_formatting.html
  dataType: ["CAST", "CONVERT", "TO_CHAR", "TO_DATE", "TO_NUMBER", "TEXT_TO_INT_ALT", "TEXT_TO_NUMERIC_ALT"],
  // https://docs.aws.amazon.com/redshift/latest/dg/r_System_administration_functions.html
  sysAdmin: ["CHANGE_QUERY_PRIORITY", "CHANGE_SESSION_PRIORITY", "CHANGE_USER_PRIORITY", "CURRENT_SETTING", "PG_CANCEL_BACKEND", "PG_TERMINATE_BACKEND", "REBOOT_CLUSTER", "SET_CONFIG"],
  // https://docs.aws.amazon.com/redshift/latest/dg/r_System_information_functions.html
  sysInfo: ["CURRENT_AWS_ACCOUNT", "CURRENT_DATABASE", "CURRENT_NAMESPACE", "CURRENT_SCHEMA", "CURRENT_SCHEMAS", "CURRENT_USER", "CURRENT_USER_ID", "HAS_ASSUMEROLE_PRIVILEGE", "HAS_DATABASE_PRIVILEGE", "HAS_SCHEMA_PRIVILEGE", "HAS_TABLE_PRIVILEGE", "PG_BACKEND_PID", "PG_GET_COLS", "PG_GET_GRANTEE_BY_IAM_ROLE", "PG_GET_IAM_ROLE_BY_USER", "PG_GET_LATE_BINDING_VIEW_COLS", "PG_LAST_COPY_COUNT", "PG_LAST_COPY_ID", "PG_LAST_UNLOAD_ID", "PG_LAST_QUERY_ID", "PG_LAST_UNLOAD_COUNT", "SESSION_USER", "SLICE_NUM", "USER", "VERSION"],
  dataTypes: ["DECIMAL", "NUMERIC", "CHAR", "CHARACTER", "VARCHAR", "CHARACTER VARYING", "NCHAR", "NVARCHAR", "VARBYTE"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/redshift/redshift.keywords.js
var keywords9 = flatKeywordList({
  // https://docs.aws.amazon.com/redshift/latest/dg/r_pg_keywords.html
  standard: ["AES128", "AES256", "ALL", "ALLOWOVERWRITE", "ANY", "ARRAY", "AS", "ASC", "AUTHORIZATION", "BACKUP", "BETWEEN", "BINARY", "BOTH", "CHECK", "COLUMN", "CONSTRAINT", "CREATE", "CROSS", "DEFAULT", "DEFERRABLE", "DEFLATE", "DEFRAG", "DESC", "DISABLE", "DISTINCT", "DO", "ENABLE", "ENCODE", "ENCRYPT", "ENCRYPTION", "EXPLICIT", "FALSE", "FOR", "FOREIGN", "FREEZE", "FROM", "FULL", "GLOBALDICT256", "GLOBALDICT64K", "GROUP", "IDENTITY", "IGNORE", "ILIKE", "IN", "INITIALLY", "INNER", "INTO", "IS", "ISNULL", "LANGUAGE", "LEADING", "LIKE", "LIMIT", "LOCALTIME", "LOCALTIMESTAMP", "LUN", "LUNS", "MINUS", "NATURAL", "NEW", "NOT", "NOTNULL", "NULL", "NULLS", "OFF", "OFFLINE", "OFFSET", "OID", "OLD", "ON", "ONLY", "OPEN", "ORDER", "OUTER", "OVERLAPS", "PARALLEL", "PARTITION", "PERCENT", "PERMISSIONS", "PLACING", "PRIMARY", "RECOVER", "REFERENCES", "REJECTLOG", "RESORT", "RESPECT", "RESTORE", "SIMILAR", "SNAPSHOT", "SOME", "SYSTEM", "TABLE", "TAG", "TDES", "THEN", "TIMESTAMP", "TO", "TOP", "TRAILING", "TRUE", "UNIQUE", "USING", "VERBOSE", "WALLET", "WITHOUT"],
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-conversion.html
  dataConversionParams: ["ACCEPTANYDATE", "ACCEPTINVCHARS", "BLANKSASNULL", "DATEFORMAT", "EMPTYASNULL", "ENCODING", "ESCAPE", "EXPLICIT_IDS", "FILLRECORD", "IGNOREBLANKLINES", "IGNOREHEADER", "REMOVEQUOTES", "ROUNDEC", "TIMEFORMAT", "TRIMBLANKS", "TRUNCATECOLUMNS"],
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-load.html
  dataLoadParams: ["COMPROWS", "COMPUPDATE", "MAXERROR", "NOLOAD", "STATUPDATE"],
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-format.html
  dataFormatParams: ["FORMAT", "CSV", "DELIMITER", "FIXEDWIDTH", "SHAPEFILE", "AVRO", "JSON", "PARQUET", "ORC"],
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-authorization.html
  copyAuthParams: ["ACCESS_KEY_ID", "CREDENTIALS", "ENCRYPTED", "IAM_ROLE", "MASTER_SYMMETRIC_KEY", "SECRET_ACCESS_KEY", "SESSION_TOKEN"],
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-file-compression.html
  copyCompressionParams: ["BZIP2", "GZIP", "LZOP", "ZSTD"],
  // https://docs.aws.amazon.com/redshift/latest/dg/r_COPY-alphabetical-parm-list.html
  copyMiscParams: ["MANIFEST", "READRATIO", "REGION", "SSH"],
  // https://docs.aws.amazon.com/redshift/latest/dg/c_Compression_encodings.html
  compressionEncodings: ["RAW", "AZ64", "BYTEDICT", "DELTA", "DELTA32K", "LZO", "MOSTLY8", "MOSTLY16", "MOSTLY32", "RUNLENGTH", "TEXT255", "TEXT32K"],
  misc: [
    // CREATE EXTERNAL SCHEMA (https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_EXTERNAL_SCHEMA.html)
    "CATALOG_ROLE",
    "SECRET_ARN",
    "EXTERNAL",
    // https://docs.aws.amazon.com/redshift/latest/dg/c_choosing_dist_sort.html
    "AUTO",
    "EVEN",
    "KEY",
    "PREDICATE",
    // ANALYZE | ANALYSE (https://docs.aws.amazon.com/redshift/latest/dg/r_ANALYZE.html)
    // unknown
    "COMPRESSION"
  ],
  /**
   * Other keywords not included:
   * STL: https://docs.aws.amazon.com/redshift/latest/dg/c_intro_STL_tables.html
   * SVCS: https://docs.aws.amazon.com/redshift/latest/dg/svcs_views.html
   * SVL: https://docs.aws.amazon.com/redshift/latest/dg/svl_views.html
   * SVV: https://docs.aws.amazon.com/redshift/latest/dg/svv_views.html
   */
  // https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-text-and-bpchar-types
  dataTypes: ["BPCHAR", "TEXT"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/redshift/redshift.formatter.js
var reservedSelect9 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses9 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET",
  // Data definition
  "CREATE [OR REPLACE | MATERIALIZED] VIEW",
  "CREATE [TEMPORARY | TEMP | LOCAL TEMPORARY | LOCAL TEMP] TABLE [IF NOT EXISTS]"
]);
var onelineClauses9 = expandPhrases([
  // - update:
  "UPDATE",
  // - delete:
  "DELETE [FROM]",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "ALTER TABLE APPEND",
  "ADD [COLUMN]",
  "DROP [COLUMN]",
  "RENAME TO",
  "RENAME COLUMN",
  "ALTER COLUMN",
  "TYPE",
  // for alter column
  "ENCODE",
  // for alter column
  // - truncate:
  "TRUNCATE [TABLE]",
  // https://docs.aws.amazon.com/redshift/latest/dg/c_SQL_commands.html
  "ABORT",
  "ALTER DATABASE",
  "ALTER DATASHARE",
  "ALTER DEFAULT PRIVILEGES",
  "ALTER GROUP",
  "ALTER MATERIALIZED VIEW",
  "ALTER PROCEDURE",
  "ALTER SCHEMA",
  "ALTER USER",
  "ANALYSE",
  "ANALYZE",
  "ANALYSE COMPRESSION",
  "ANALYZE COMPRESSION",
  "BEGIN",
  "CALL",
  "CANCEL",
  "CLOSE",
  "COMMENT",
  "COMMIT",
  "COPY",
  "CREATE DATABASE",
  "CREATE DATASHARE",
  "CREATE EXTERNAL FUNCTION",
  "CREATE EXTERNAL SCHEMA",
  "CREATE EXTERNAL TABLE",
  "CREATE FUNCTION",
  "CREATE GROUP",
  "CREATE LIBRARY",
  "CREATE MODEL",
  "CREATE PROCEDURE",
  "CREATE SCHEMA",
  "CREATE USER",
  "DEALLOCATE",
  "DECLARE",
  "DESC DATASHARE",
  "DROP DATABASE",
  "DROP DATASHARE",
  "DROP FUNCTION",
  "DROP GROUP",
  "DROP LIBRARY",
  "DROP MODEL",
  "DROP MATERIALIZED VIEW",
  "DROP PROCEDURE",
  "DROP SCHEMA",
  "DROP USER",
  "DROP VIEW",
  "DROP",
  "EXECUTE",
  "EXPLAIN",
  "FETCH",
  "GRANT",
  "LOCK",
  "PREPARE",
  "REFRESH MATERIALIZED VIEW",
  "RESET",
  "REVOKE",
  "ROLLBACK",
  "SELECT INTO",
  "SET SESSION AUTHORIZATION",
  "SET SESSION CHARACTERISTICS",
  "SHOW",
  "SHOW EXTERNAL TABLE",
  "SHOW MODEL",
  "SHOW DATASHARES",
  "SHOW PROCEDURE",
  "SHOW TABLE",
  "SHOW VIEW",
  "START TRANSACTION",
  "UNLOAD",
  "VACUUM"
]);
var reservedSetOperations9 = expandPhrases(["UNION [ALL]", "EXCEPT", "INTERSECT", "MINUS"]);
var reservedJoins9 = expandPhrases(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"]);
var reservedPhrases9 = expandPhrases([
  // https://docs.aws.amazon.com/redshift/latest/dg/copy-parameters-data-conversion.html
  "NULL AS",
  // https://docs.aws.amazon.com/redshift/latest/dg/r_CREATE_EXTERNAL_SCHEMA.html
  "DATA CATALOG",
  "HIVE METASTORE",
  // in window specifications
  "{ROWS | RANGE} BETWEEN"
]);
var redshift = {
  tokenizerOptions: {
    reservedSelect: reservedSelect9,
    reservedClauses: [...reservedClauses9, ...onelineClauses9],
    reservedSetOperations: reservedSetOperations9,
    reservedJoins: reservedJoins9,
    reservedPhrases: reservedPhrases9,
    reservedKeywords: keywords9,
    reservedFunctionNames: functions9,
    stringTypes: ["''-qq"],
    identTypes: [`""-qq`],
    identChars: {
      first: "#"
    },
    paramTypes: {
      numbered: ["$"]
    },
    operators: [
      "^",
      "%",
      "@",
      "|/",
      "||/",
      "&",
      "|",
      // '#', conflicts with first char of identifier
      "~",
      "<<",
      ">>",
      "||",
      "::"
    ]
  },
  formatOptions: {
    alwaysDenseOperators: ["::"],
    onelineClauses: onelineClauses9
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/spark/spark.keywords.js
var keywords10 = flatKeywordList({
  // https://deepkb.com/CO_000013/en/kb/IMPORT-fbfa59f0-2bf1-31fe-bb7b-0f9efe9932c6/spark-sql-keywords
  all: [
    "ADD",
    "AFTER",
    "ALL",
    "ALTER",
    "ANALYZE",
    "AND",
    "ANTI",
    "ANY",
    "ARCHIVE",
    "ARRAY",
    "AS",
    "ASC",
    "AT",
    "AUTHORIZATION",
    "BETWEEN",
    "BOTH",
    "BUCKET",
    "BUCKETS",
    "BY",
    "CACHE",
    "CASCADE",
    "CAST",
    "CHANGE",
    "CHECK",
    "CLEAR",
    "CLUSTER",
    "CLUSTERED",
    "CODEGEN",
    "COLLATE",
    "COLLECTION",
    "COLUMN",
    "COLUMNS",
    "COMMENT",
    "COMMIT",
    "COMPACT",
    "COMPACTIONS",
    "COMPUTE",
    "CONCATENATE",
    "CONSTRAINT",
    "COST",
    "CREATE",
    "CROSS",
    "CUBE",
    "CURRENT",
    "CURRENT_DATE",
    "CURRENT_TIME",
    "CURRENT_TIMESTAMP",
    "CURRENT_USER",
    "DATA",
    "DATABASE",
    "DATABASES",
    "DAY",
    "DBPROPERTIES",
    "DEFINED",
    "DELETE",
    "DELIMITED",
    "DESC",
    "DESCRIBE",
    "DFS",
    "DIRECTORIES",
    "DIRECTORY",
    "DISTINCT",
    "DISTRIBUTE",
    "DIV",
    "DROP",
    "ESCAPE",
    "ESCAPED",
    "EXCEPT",
    "EXCHANGE",
    "EXISTS",
    "EXPORT",
    "EXTENDED",
    "EXTERNAL",
    "EXTRACT",
    "FALSE",
    "FETCH",
    "FIELDS",
    "FILTER",
    "FILEFORMAT",
    "FIRST",
    "FIRST_VALUE",
    "FOLLOWING",
    "FOR",
    "FOREIGN",
    "FORMAT",
    "FORMATTED",
    "FULL",
    "FUNCTION",
    "FUNCTIONS",
    "GLOBAL",
    "GRANT",
    "GROUP",
    "GROUPING",
    "HOUR",
    "IF",
    "IGNORE",
    "IMPORT",
    "IN",
    "INDEX",
    "INDEXES",
    "INNER",
    "INPATH",
    "INPUTFORMAT",
    "INTERSECT",
    "INTERVAL",
    "INTO",
    "IS",
    "ITEMS",
    "KEYS",
    "LAST",
    "LAST_VALUE",
    "LATERAL",
    "LAZY",
    "LEADING",
    "LEFT",
    "LIKE",
    "LINES",
    "LIST",
    "LOCAL",
    "LOCATION",
    "LOCK",
    "LOCKS",
    "LOGICAL",
    "MACRO",
    "MAP",
    "MATCHED",
    "MERGE",
    "MINUTE",
    "MONTH",
    "MSCK",
    "NAMESPACE",
    "NAMESPACES",
    "NATURAL",
    "NO",
    "NOT",
    "NULL",
    "NULLS",
    "OF",
    "ONLY",
    "OPTION",
    "OPTIONS",
    "OR",
    "ORDER",
    "OUT",
    "OUTER",
    "OUTPUTFORMAT",
    "OVER",
    "OVERLAPS",
    "OVERLAY",
    "OVERWRITE",
    "OWNER",
    "PARTITION",
    "PARTITIONED",
    "PARTITIONS",
    "PERCENT",
    "PLACING",
    "POSITION",
    "PRECEDING",
    "PRIMARY",
    "PRINCIPALS",
    "PROPERTIES",
    "PURGE",
    "QUERY",
    "RANGE",
    "RECORDREADER",
    "RECORDWRITER",
    "RECOVER",
    "REDUCE",
    "REFERENCES",
    "RENAME",
    "REPAIR",
    "REPLACE",
    "RESPECT",
    "RESTRICT",
    "REVOKE",
    "RIGHT",
    "RLIKE",
    "ROLE",
    "ROLES",
    "ROLLBACK",
    "ROLLUP",
    "ROW",
    "ROWS",
    "SCHEMA",
    "SECOND",
    "SELECT",
    "SEMI",
    "SEPARATED",
    "SERDE",
    "SERDEPROPERTIES",
    "SESSION_USER",
    "SETS",
    "SHOW",
    "SKEWED",
    "SOME",
    "SORT",
    "SORTED",
    "START",
    "STATISTICS",
    "STORED",
    "STRATIFY",
    "STRUCT",
    "SUBSTR",
    "SUBSTRING",
    "TABLE",
    "TABLES",
    "TBLPROPERTIES",
    "TEMPORARY",
    "TERMINATED",
    "THEN",
    "TO",
    "TOUCH",
    "TRAILING",
    "TRANSACTION",
    "TRANSACTIONS",
    "TRIM",
    "TRUE",
    "TRUNCATE",
    "UNARCHIVE",
    "UNBOUNDED",
    "UNCACHE",
    "UNIQUE",
    "UNKNOWN",
    "UNLOCK",
    "UNSET",
    "USE",
    "USER",
    "USING",
    "VIEW",
    "WINDOW",
    "YEAR",
    // other
    "ANALYSE",
    "ARRAY_ZIP",
    "COALESCE",
    "CONTAINS",
    "CONVERT",
    "DAYS",
    "DAY_HOUR",
    "DAY_MINUTE",
    "DAY_SECOND",
    "DECODE",
    "DEFAULT",
    "DISTINCTROW",
    "ENCODE",
    "EXPLODE",
    "EXPLODE_OUTER",
    "FIXED",
    "GREATEST",
    "GROUP_CONCAT",
    "HOURS",
    "HOUR_MINUTE",
    "HOUR_SECOND",
    "IFNULL",
    "LEAST",
    "LEVEL",
    "MINUTE_SECOND",
    "NULLIF",
    "OFFSET",
    "ON",
    "OPTIMIZE",
    "REGEXP",
    "SEPARATOR",
    "SIZE",
    "STRING",
    "TYPE",
    "TYPES",
    "UNSIGNED",
    "VARIABLES",
    "YEAR_MONTH"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/spark/spark.functions.js
var functions10 = flatKeywordList({
  // http://spark.apache.org/docs/latest/sql-ref-functions.html
  //
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#aggregate-functions
  aggregate: [
    // 'ANY',
    "APPROX_COUNT_DISTINCT",
    "APPROX_PERCENTILE",
    "AVG",
    "BIT_AND",
    "BIT_OR",
    "BIT_XOR",
    "BOOL_AND",
    "BOOL_OR",
    "COLLECT_LIST",
    "COLLECT_SET",
    "CORR",
    "COUNT",
    "COUNT",
    "COUNT",
    "COUNT_IF",
    "COUNT_MIN_SKETCH",
    "COVAR_POP",
    "COVAR_SAMP",
    "EVERY",
    "FIRST",
    "FIRST_VALUE",
    "GROUPING",
    "GROUPING_ID",
    "KURTOSIS",
    "LAST",
    "LAST_VALUE",
    "MAX",
    "MAX_BY",
    "MEAN",
    "MIN",
    "MIN_BY",
    "PERCENTILE",
    "PERCENTILE",
    "PERCENTILE_APPROX",
    "SKEWNESS",
    // 'SOME',
    "STD",
    "STDDEV",
    "STDDEV_POP",
    "STDDEV_SAMP",
    "SUM",
    "VAR_POP",
    "VAR_SAMP",
    "VARIANCE"
  ],
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#window-functions
  window: ["CUME_DIST", "DENSE_RANK", "LAG", "LEAD", "NTH_VALUE", "NTILE", "PERCENT_RANK", "RANK", "ROW_NUMBER"],
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#array-functions
  array: ["ARRAY", "ARRAY_CONTAINS", "ARRAY_DISTINCT", "ARRAY_EXCEPT", "ARRAY_INTERSECT", "ARRAY_JOIN", "ARRAY_MAX", "ARRAY_MIN", "ARRAY_POSITION", "ARRAY_REMOVE", "ARRAY_REPEAT", "ARRAY_UNION", "ARRAYS_OVERLAP", "ARRAYS_ZIP", "FLATTEN", "SEQUENCE", "SHUFFLE", "SLICE", "SORT_ARRAY"],
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#map-functions
  map: ["ELEMENT_AT", "ELEMENT_AT", "MAP", "MAP_CONCAT", "MAP_ENTRIES", "MAP_FROM_ARRAYS", "MAP_FROM_ENTRIES", "MAP_KEYS", "MAP_VALUES", "STR_TO_MAP"],
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#date-and-timestamp-functions
  datetime: ["ADD_MONTHS", "CURRENT_DATE", "CURRENT_DATE", "CURRENT_TIMESTAMP", "CURRENT_TIMESTAMP", "CURRENT_TIMEZONE", "DATE_ADD", "DATE_FORMAT", "DATE_FROM_UNIX_DATE", "DATE_PART", "DATE_SUB", "DATE_TRUNC", "DATEDIFF", "DAY", "DAYOFMONTH", "DAYOFWEEK", "DAYOFYEAR", "EXTRACT", "FROM_UNIXTIME", "FROM_UTC_TIMESTAMP", "HOUR", "LAST_DAY", "MAKE_DATE", "MAKE_DT_INTERVAL", "MAKE_INTERVAL", "MAKE_TIMESTAMP", "MAKE_YM_INTERVAL", "MINUTE", "MONTH", "MONTHS_BETWEEN", "NEXT_DAY", "NOW", "QUARTER", "SECOND", "SESSION_WINDOW", "TIMESTAMP_MICROS", "TIMESTAMP_MILLIS", "TIMESTAMP_SECONDS", "TO_DATE", "TO_TIMESTAMP", "TO_UNIX_TIMESTAMP", "TO_UTC_TIMESTAMP", "TRUNC", "UNIX_DATE", "UNIX_MICROS", "UNIX_MILLIS", "UNIX_SECONDS", "UNIX_TIMESTAMP", "WEEKDAY", "WEEKOFYEAR", "WINDOW", "YEAR"],
  // http://spark.apache.org/docs/latest/sql-ref-functions-builtin.html#json-functions
  json: ["FROM_JSON", "GET_JSON_OBJECT", "JSON_ARRAY_LENGTH", "JSON_OBJECT_KEYS", "JSON_TUPLE", "SCHEMA_OF_JSON", "TO_JSON"],
  // http://spark.apache.org/docs/latest/api/sql/index.html
  misc: [
    "ABS",
    "ACOS",
    "ACOSH",
    "AGGREGATE",
    "ARRAY_SORT",
    "ASCII",
    "ASIN",
    "ASINH",
    "ASSERT_TRUE",
    "ATAN",
    "ATAN2",
    "ATANH",
    "BASE64",
    "BIGINT",
    "BIN",
    "BINARY",
    "BIT_COUNT",
    "BIT_GET",
    "BIT_LENGTH",
    "BOOLEAN",
    "BROUND",
    "BTRIM",
    "CARDINALITY",
    "CBRT",
    "CEIL",
    "CEILING",
    "CHAR",
    "CHAR_LENGTH",
    "CHARACTER_LENGTH",
    "CHR",
    "CONCAT",
    "CONCAT_WS",
    "CONV",
    "COS",
    "COSH",
    "COT",
    "CRC32",
    "CURRENT_CATALOG",
    "CURRENT_DATABASE",
    "CURRENT_USER",
    "DATE",
    "DECIMAL",
    "DEGREES",
    "DOUBLE",
    // 'E',
    "ELT",
    "EXP",
    "EXPM1",
    "FACTORIAL",
    "FIND_IN_SET",
    "FLOAT",
    "FLOOR",
    "FORALL",
    "FORMAT_NUMBER",
    "FORMAT_STRING",
    "FROM_CSV",
    "GETBIT",
    "HASH",
    "HEX",
    "HYPOT",
    "INITCAP",
    "INLINE",
    "INLINE_OUTER",
    "INPUT_FILE_BLOCK_LENGTH",
    "INPUT_FILE_BLOCK_START",
    "INPUT_FILE_NAME",
    "INSTR",
    "INT",
    "ISNAN",
    "ISNOTNULL",
    "ISNULL",
    "JAVA_METHOD",
    "LCASE",
    "LEFT",
    "LENGTH",
    "LEVENSHTEIN",
    "LN",
    "LOCATE",
    "LOG",
    "LOG10",
    "LOG1P",
    "LOG2",
    "LOWER",
    "LPAD",
    "LTRIM",
    "MAP_FILTER",
    "MAP_ZIP_WITH",
    "MD5",
    "MOD",
    "MONOTONICALLY_INCREASING_ID",
    "NAMED_STRUCT",
    "NANVL",
    "NEGATIVE",
    "NVL",
    "NVL2",
    "OCTET_LENGTH",
    "OVERLAY",
    "PARSE_URL",
    "PI",
    "PMOD",
    "POSEXPLODE",
    "POSEXPLODE_OUTER",
    "POSITION",
    "POSITIVE",
    "POW",
    "POWER",
    "PRINTF",
    "RADIANS",
    "RAISE_ERROR",
    "RAND",
    "RANDN",
    "RANDOM",
    "REFLECT",
    "REGEXP_EXTRACT",
    "REGEXP_EXTRACT_ALL",
    "REGEXP_LIKE",
    "REGEXP_REPLACE",
    "REPEAT",
    "REPLACE",
    "REVERSE",
    "RIGHT",
    "RINT",
    "ROUND",
    "RPAD",
    "RTRIM",
    "SCHEMA_OF_CSV",
    "SENTENCES",
    "SHA",
    "SHA1",
    "SHA2",
    "SHIFTLEFT",
    "SHIFTRIGHT",
    "SHIFTRIGHTUNSIGNED",
    "SIGN",
    "SIGNUM",
    "SIN",
    "SINH",
    "SMALLINT",
    "SOUNDEX",
    "SPACE",
    "SPARK_PARTITION_ID",
    "SPLIT",
    "SQRT",
    "STACK",
    "SUBSTR",
    "SUBSTRING",
    "SUBSTRING_INDEX",
    "TAN",
    "TANH",
    "TIMESTAMP",
    "TINYINT",
    "TO_CSV",
    "TRANSFORM_KEYS",
    "TRANSFORM_VALUES",
    "TRANSLATE",
    "TRIM",
    "TRY_ADD",
    "TRY_DIVIDE",
    "TYPEOF",
    "UCASE",
    "UNBASE64",
    "UNHEX",
    "UPPER",
    "UUID",
    "VERSION",
    "WIDTH_BUCKET",
    "XPATH",
    "XPATH_BOOLEAN",
    "XPATH_DOUBLE",
    "XPATH_FLOAT",
    "XPATH_INT",
    "XPATH_LONG",
    "XPATH_NUMBER",
    "XPATH_SHORT",
    "XPATH_STRING",
    "XXHASH64",
    "ZIP_WITH"
  ],
  cast: ["CAST"],
  // Shorthand functions to use in place of CASE expression
  caseAbbrev: ["COALESCE", "NULLIF"],
  // Parameterized data types
  // https://spark.apache.org/docs/latest/sql-ref-datatypes.html
  dataTypes: [
    "DECIMAL",
    "DEC",
    "NUMERIC",
    // No varchar type in Spark, only STRING. Added for the sake of tests
    "VARCHAR"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/spark/spark.formatter.js
var reservedSelect10 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses10 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "SORT BY",
  "CLUSTER BY",
  "DISTRIBUTE BY",
  "LIMIT",
  // Data manipulation
  // - insert:
  "INSERT [INTO | OVERWRITE] [TABLE]",
  "VALUES",
  // - insert overwrite directory:
  //   https://spark.apache.org/docs/latest/sql-ref-syntax-dml-insert-overwrite-directory.html
  "INSERT OVERWRITE [LOCAL] DIRECTORY",
  // - load:
  //   https://spark.apache.org/docs/latest/sql-ref-syntax-dml-load.html
  "LOAD DATA [LOCAL] INPATH",
  "[OVERWRITE] INTO TABLE",
  // Data definition
  "CREATE [OR REPLACE] [GLOBAL TEMPORARY | TEMPORARY] VIEW [IF NOT EXISTS]",
  "CREATE [EXTERNAL] TABLE [IF NOT EXISTS]"
]);
var onelineClauses10 = expandPhrases([
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "ADD COLUMNS",
  "DROP {COLUMN | COLUMNS}",
  "RENAME TO",
  "RENAME COLUMN",
  "ALTER COLUMN",
  // - truncate:
  "TRUNCATE TABLE",
  // other
  "LATERAL VIEW",
  "ALTER DATABASE",
  "ALTER VIEW",
  "CREATE DATABASE",
  "CREATE FUNCTION",
  "DROP DATABASE",
  "DROP FUNCTION",
  "DROP VIEW",
  "REPAIR TABLE",
  "USE DATABASE",
  // Data Retrieval
  "TABLESAMPLE",
  "PIVOT",
  "TRANSFORM",
  "EXPLAIN",
  // Auxiliary
  "ADD FILE",
  "ADD JAR",
  "ANALYZE TABLE",
  "CACHE TABLE",
  "CLEAR CACHE",
  "DESCRIBE DATABASE",
  "DESCRIBE FUNCTION",
  "DESCRIBE QUERY",
  "DESCRIBE TABLE",
  "LIST FILE",
  "LIST JAR",
  "REFRESH",
  "REFRESH TABLE",
  "REFRESH FUNCTION",
  "RESET",
  "SHOW COLUMNS",
  "SHOW CREATE TABLE",
  "SHOW DATABASES",
  "SHOW FUNCTIONS",
  "SHOW PARTITIONS",
  "SHOW TABLE EXTENDED",
  "SHOW TABLES",
  "SHOW TBLPROPERTIES",
  "SHOW VIEWS",
  "UNCACHE TABLE"
]);
var reservedSetOperations10 = expandPhrases(["UNION [ALL | DISTINCT]", "EXCEPT [ALL | DISTINCT]", "INTERSECT [ALL | DISTINCT]"]);
var reservedJoins10 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL [INNER] JOIN",
  "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN",
  // non-standard-joins
  "[LEFT] {ANTI | SEMI} JOIN",
  "NATURAL [LEFT] {ANTI | SEMI} JOIN"
]);
var reservedPhrases10 = expandPhrases(["ON DELETE", "ON UPDATE", "CURRENT ROW", "{ROWS | RANGE} BETWEEN"]);
var spark = {
  tokenizerOptions: {
    reservedSelect: reservedSelect10,
    reservedClauses: [...reservedClauses10, ...onelineClauses10],
    reservedSetOperations: reservedSetOperations10,
    reservedJoins: reservedJoins10,
    reservedPhrases: reservedPhrases10,
    supportsXor: true,
    reservedKeywords: keywords10,
    reservedFunctionNames: functions10,
    extraParens: ["[]"],
    stringTypes: ["''-bs", '""-bs', {
      quote: "''-raw",
      prefixes: ["R", "X"],
      requirePrefix: true
    }, {
      quote: '""-raw',
      prefixes: ["R", "X"],
      requirePrefix: true
    }],
    identTypes: ["``"],
    variableTypes: [{
      quote: "{}",
      prefixes: ["$"],
      requirePrefix: true
    }],
    operators: ["%", "~", "^", "|", "&", "<=>", "==", "!", "||", "->"],
    postProcess: postProcess5
  },
  formatOptions: {
    onelineClauses: onelineClauses10
  }
};
function postProcess5(tokens) {
  return tokens.map((token, i) => {
    const prevToken = tokens[i - 1] || EOF_TOKEN;
    const nextToken = tokens[i + 1] || EOF_TOKEN;
    if (isToken.WINDOW(token) && nextToken.type === TokenType.OPEN_PAREN) {
      return {
        ...token,
        type: TokenType.RESERVED_FUNCTION_NAME
      };
    }
    if (token.text === "ITEMS" && token.type === TokenType.RESERVED_KEYWORD) {
      if (!(prevToken.text === "COLLECTION" && nextToken.text === "TERMINATED")) {
        return {
          ...token,
          type: TokenType.IDENTIFIER,
          text: token.raw
        };
      }
    }
    return token;
  });
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/sqlite/sqlite.functions.js
var functions11 = flatKeywordList({
  // https://www.sqlite.org/lang_corefunc.html
  scalar: ["ABS", "CHANGES", "CHAR", "COALESCE", "FORMAT", "GLOB", "HEX", "IFNULL", "IIF", "INSTR", "LAST_INSERT_ROWID", "LENGTH", "LIKE", "LIKELIHOOD", "LIKELY", "LOAD_EXTENSION", "LOWER", "LTRIM", "NULLIF", "PRINTF", "QUOTE", "RANDOM", "RANDOMBLOB", "REPLACE", "ROUND", "RTRIM", "SIGN", "SOUNDEX", "SQLITE_COMPILEOPTION_GET", "SQLITE_COMPILEOPTION_USED", "SQLITE_OFFSET", "SQLITE_SOURCE_ID", "SQLITE_VERSION", "SUBSTR", "SUBSTRING", "TOTAL_CHANGES", "TRIM", "TYPEOF", "UNICODE", "UNLIKELY", "UPPER", "ZEROBLOB"],
  // https://www.sqlite.org/lang_aggfunc.html
  aggregate: ["AVG", "COUNT", "GROUP_CONCAT", "MAX", "MIN", "SUM", "TOTAL"],
  // https://www.sqlite.org/lang_datefunc.html
  datetime: ["DATE", "TIME", "DATETIME", "JULIANDAY", "UNIXEPOCH", "STRFTIME"],
  // https://www.sqlite.org/windowfunctions.html#biwinfunc
  window: ["row_number", "rank", "dense_rank", "percent_rank", "cume_dist", "ntile", "lag", "lead", "first_value", "last_value", "nth_value"],
  // https://www.sqlite.org/lang_mathfunc.html
  math: ["ACOS", "ACOSH", "ASIN", "ASINH", "ATAN", "ATAN2", "ATANH", "CEIL", "CEILING", "COS", "COSH", "DEGREES", "EXP", "FLOOR", "LN", "LOG", "LOG", "LOG10", "LOG2", "MOD", "PI", "POW", "POWER", "RADIANS", "SIN", "SINH", "SQRT", "TAN", "TANH", "TRUNC"],
  // https://www.sqlite.org/json1.html
  json: ["JSON", "JSON_ARRAY", "JSON_ARRAY_LENGTH", "JSON_ARRAY_LENGTH", "JSON_EXTRACT", "JSON_INSERT", "JSON_OBJECT", "JSON_PATCH", "JSON_REMOVE", "JSON_REPLACE", "JSON_SET", "JSON_TYPE", "JSON_TYPE", "JSON_VALID", "JSON_QUOTE", "JSON_GROUP_ARRAY", "JSON_GROUP_OBJECT", "JSON_EACH", "JSON_TREE"],
  cast: ["CAST"],
  // SQLite allows parameters for all data types
  // Well, in fact it allows any word as a data type, e.g. CREATE TABLE foo (col1 madeupname(123));
  // https://www.sqlite.org/datatype3.html
  dataTypes: ["CHARACTER", "VARCHAR", "VARYING CHARACTER", "NCHAR", "NATIVE CHARACTER", "NVARCHAR", "NUMERIC", "DECIMAL"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/sqlite/sqlite.keywords.js
var keywords11 = flatKeywordList({
  // https://www.sqlite.org/lang_keywords.html
  all: ["ABORT", "ACTION", "ADD", "AFTER", "ALL", "ALTER", "AND", "ANY", "ARE", "ARRAY", "ALWAYS", "ANALYZE", "AS", "ASC", "ATTACH", "AUTOINCREMENT", "BEFORE", "BEGIN", "BETWEEN", "BY", "CASCADE", "CASE", "CAST", "CHECK", "COLLATE", "COLUMN", "COMMIT", "CONFLICT", "CONSTRAINT", "CREATE", "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "DATABASE", "DEFAULT", "DEFERRABLE", "DEFERRED", "DELETE", "DESC", "DETACH", "DISTINCT", "DO", "DROP", "EACH", "ELSE", "END", "ESCAPE", "EXCEPT", "EXCLUDE", "EXCLUSIVE", "EXISTS", "EXPLAIN", "FAIL", "FILTER", "FIRST", "FOLLOWING", "FOR", "FOREIGN", "FROM", "FULL", "GENERATED", "GLOB", "GROUP", "GROUPS", "HAVING", "IF", "IGNORE", "IMMEDIATE", "IN", "INDEX", "INDEXED", "INITIALLY", "INNER", "INSERT", "INSTEAD", "INTERSECT", "INTO", "IS", "ISNULL", "JOIN", "KEY", "LAST", "LEFT", "LIKE", "LIMIT", "MATCH", "MATERIALIZED", "NATURAL", "NO", "NOT", "NOTHING", "NOTNULL", "NULL", "NULLS", "OF", "OFFSET", "ON", "ONLY", "OPEN", "OR", "ORDER", "OTHERS", "OUTER", "OVER", "PARTITION", "PLAN", "PRAGMA", "PRECEDING", "PRIMARY", "QUERY", "RAISE", "RANGE", "RECURSIVE", "REFERENCES", "REGEXP", "REINDEX", "RELEASE", "RENAME", "REPLACE", "RESTRICT", "RETURNING", "RIGHT", "ROLLBACK", "ROW", "ROWS", "SAVEPOINT", "SELECT", "SET", "TABLE", "TEMP", "TEMPORARY", "THEN", "TIES", "TO", "TRANSACTION", "TRIGGER", "UNBOUNDED", "UNION", "UNIQUE", "UPDATE", "USING", "VACUUM", "VALUES", "VIEW", "VIRTUAL", "WHEN", "WHERE", "WINDOW", "WITH", "WITHOUT"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/sqlite/sqlite.formatter.js
var reservedSelect11 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses11 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT [OR ABORT | OR FAIL | OR IGNORE | OR REPLACE | OR ROLLBACK] INTO",
  "REPLACE INTO",
  "VALUES",
  // - update:
  "SET",
  // Data definition
  "CREATE [TEMPORARY | TEMP] VIEW [IF NOT EXISTS]",
  "CREATE [TEMPORARY | TEMP] TABLE [IF NOT EXISTS]"
]);
var onelineClauses11 = expandPhrases([
  // - update:
  "UPDATE [OR ABORT | OR FAIL | OR IGNORE | OR REPLACE | OR ROLLBACK]",
  // - insert:
  "ON CONFLICT",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "ADD [COLUMN]",
  "DROP [COLUMN]",
  "RENAME [COLUMN]",
  "RENAME TO",
  // - set schema
  "SET SCHEMA"
]);
var reservedSetOperations11 = expandPhrases(["UNION [ALL]", "EXCEPT", "INTERSECT"]);
var reservedJoins11 = expandPhrases(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"]);
var reservedPhrases11 = expandPhrases(["ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]", "{ROWS | RANGE | GROUPS} BETWEEN"]);
var sqlite = {
  tokenizerOptions: {
    reservedSelect: reservedSelect11,
    reservedClauses: [...reservedClauses11, ...onelineClauses11],
    reservedSetOperations: reservedSetOperations11,
    reservedJoins: reservedJoins11,
    reservedPhrases: reservedPhrases11,
    reservedKeywords: keywords11,
    reservedFunctionNames: functions11,
    stringTypes: [
      "''-qq",
      {
        quote: "''-raw",
        prefixes: ["X"],
        requirePrefix: true
      }
      // Depending on context SQLite also supports double-quotes for strings,
      // and single-quotes for identifiers.
    ],
    identTypes: [`""-qq`, "``", "[]"],
    // https://www.sqlite.org/lang_expr.html#parameters
    paramTypes: {
      positional: true,
      numbered: ["?"],
      named: [":", "@", "$"]
    },
    operators: ["%", "~", "&", "|", "<<", ">>", "==", "->", "->>", "||"]
  },
  formatOptions: {
    onelineClauses: onelineClauses11
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/sql/sql.functions.js
var functions12 = flatKeywordList({
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_9_set_function_specification
  set: ["GROUPING"],
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_10_window_function
  window: ["RANK", "DENSE_RANK", "PERCENT_RANK", "CUME_DIST", "ROW_NUMBER"],
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_27_numeric_value_function
  numeric: ["POSITION", "OCCURRENCES_REGEX", "POSITION_REGEX", "EXTRACT", "CHAR_LENGTH", "CHARACTER_LENGTH", "OCTET_LENGTH", "CARDINALITY", "ABS", "MOD", "LN", "EXP", "POWER", "SQRT", "FLOOR", "CEIL", "CEILING", "WIDTH_BUCKET"],
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_29_string_value_function
  string: ["SUBSTRING", "SUBSTRING_REGEX", "UPPER", "LOWER", "CONVERT", "TRANSLATE", "TRANSLATE_REGEX", "TRIM", "OVERLAY", "NORMALIZE", "SPECIFICTYPE"],
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_31_datetime_value_function
  datetime: ["CURRENT_DATE", "CURRENT_TIME", "LOCALTIME", "CURRENT_TIMESTAMP", "LOCALTIMESTAMP"],
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_6_38_multiset_value_function
  // SET serves multiple roles: a SET() function and a SET keyword e.g. in UPDATE table SET ...
  // multiset: ['SET'], (disabled for now)
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#_10_9_aggregate_function
  aggregate: [
    "COUNT",
    "AVG",
    "MAX",
    "MIN",
    "SUM",
    // 'EVERY',
    // 'ANY',
    // 'SOME',
    "STDDEV_POP",
    "STDDEV_SAMP",
    "VAR_SAMP",
    "VAR_POP",
    "COLLECT",
    "FUSION",
    "INTERSECTION",
    "COVAR_POP",
    "COVAR_SAMP",
    "CORR",
    "REGR_SLOPE",
    "REGR_INTERCEPT",
    "REGR_COUNT",
    "REGR_R2",
    "REGR_AVGX",
    "REGR_AVGY",
    "REGR_SXX",
    "REGR_SYY",
    "REGR_SXY",
    "PERCENTILE_CONT",
    "PERCENTILE_DISC"
  ],
  // CAST is a pretty complex case, involving multiple forms:
  // - CAST(col AS int)
  // - CAST(...) WITH ...
  // - CAST FROM int
  // - CREATE CAST(mycol AS int) WITH ...
  cast: ["CAST"],
  // Shorthand functions to use in place of CASE expression
  caseAbbrev: ["COALESCE", "NULLIF"],
  // Non-standard functions that have widespread support
  nonStandard: ["ROUND", "SIN", "COS", "TAN", "ASIN", "ACOS", "ATAN"],
  // Data types with parameters like VARCHAR(100)
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#predefined-type
  dataTypes: ["CHARACTER", "CHAR", "CHARACTER VARYING", "CHAR VARYING", "VARCHAR", "CHARACTER LARGE OBJECT", "CHAR LARGE OBJECT", "CLOB", "NATIONAL CHARACTER", "NATIONAL CHAR", "NCHAR", "NATIONAL CHARACTER VARYING", "NATIONAL CHAR VARYING", "NCHAR VARYING", "NATIONAL CHARACTER LARGE OBJECT", "NCHAR LARGE OBJECT", "NCLOB", "BINARY", "BINARY VARYING", "VARBINARY", "BINARY LARGE OBJECT", "BLOB", "NUMERIC", "DECIMAL", "DEC", "TIME", "TIMESTAMP"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/sql/sql.keywords.js
var keywords12 = flatKeywordList({
  // https://jakewheat.github.io/sql-overview/sql-2008-foundation-grammar.html#reserved-word
  all: [
    "ALL",
    "ALLOCATE",
    "ALTER",
    "ANY",
    // <- moved over from functions
    "ARE",
    "ARRAY",
    "AS",
    "ASENSITIVE",
    "ASYMMETRIC",
    "AT",
    "ATOMIC",
    "AUTHORIZATION",
    "BEGIN",
    "BETWEEN",
    "BIGINT",
    "BINARY",
    "BLOB",
    "BOOLEAN",
    "BOTH",
    "BY",
    "CALL",
    "CALLED",
    "CASCADED",
    "CAST",
    "CHAR",
    "CHARACTER",
    "CHECK",
    "CLOB",
    "CLOSE",
    "COALESCE",
    "COLLATE",
    "COLUMN",
    "COMMIT",
    "CONDITION",
    "CONNECT",
    "CONSTRAINT",
    "CORRESPONDING",
    "CREATE",
    "CROSS",
    "CUBE",
    "CURRENT",
    "CURRENT_CATALOG",
    "CURRENT_DEFAULT_TRANSFORM_GROUP",
    "CURRENT_PATH",
    "CURRENT_ROLE",
    "CURRENT_SCHEMA",
    "CURRENT_TRANSFORM_GROUP_FOR_TYPE",
    "CURRENT_USER",
    "CURSOR",
    "CYCLE",
    "DATE",
    "DAY",
    "DEALLOCATE",
    "DEC",
    "DECIMAL",
    "DECLARE",
    "DEFAULT",
    "DELETE",
    "DEREF",
    "DESCRIBE",
    "DETERMINISTIC",
    "DISCONNECT",
    "DISTINCT",
    "DOUBLE",
    "DROP",
    "DYNAMIC",
    "EACH",
    "ELEMENT",
    "END-EXEC",
    "ESCAPE",
    "EVERY",
    // <- moved over from functions
    "EXCEPT",
    "EXEC",
    "EXECUTE",
    "EXISTS",
    "EXTERNAL",
    "FALSE",
    "FETCH",
    "FILTER",
    "FLOAT",
    "FOR",
    "FOREIGN",
    "FREE",
    "FROM",
    "FULL",
    "FUNCTION",
    "GET",
    "GLOBAL",
    "GRANT",
    "GROUP",
    "HAVING",
    "HOLD",
    "HOUR",
    "IDENTITY",
    "IN",
    "INDICATOR",
    "INNER",
    "INOUT",
    "INSENSITIVE",
    "INSERT",
    "INT",
    "INTEGER",
    "INTERSECT",
    "INTERVAL",
    "INTO",
    "IS",
    "LANGUAGE",
    "LARGE",
    "LATERAL",
    "LEADING",
    "LEFT",
    "LIKE",
    "LIKE_REGEX",
    "LOCAL",
    "MATCH",
    "MEMBER",
    "MERGE",
    "METHOD",
    "MINUTE",
    "MODIFIES",
    "MODULE",
    "MONTH",
    "MULTISET",
    "NATIONAL",
    "NATURAL",
    "NCHAR",
    "NCLOB",
    "NEW",
    "NO",
    "NONE",
    "NOT",
    "NULL",
    "NULLIF",
    "NUMERIC",
    "OF",
    "OLD",
    "ON",
    "ONLY",
    "OPEN",
    "ORDER",
    "OUT",
    "OUTER",
    "OVER",
    "OVERLAPS",
    "PARAMETER",
    "PARTITION",
    "PRECISION",
    "PREPARE",
    "PRIMARY",
    "PROCEDURE",
    "RANGE",
    "READS",
    "REAL",
    "RECURSIVE",
    "REF",
    "REFERENCES",
    "REFERENCING",
    "RELEASE",
    "RESULT",
    "RETURN",
    "RETURNS",
    "REVOKE",
    "RIGHT",
    "ROLLBACK",
    "ROLLUP",
    "ROW",
    "ROWS",
    "SAVEPOINT",
    "SCOPE",
    "SCROLL",
    "SEARCH",
    "SECOND",
    "SELECT",
    "SENSITIVE",
    "SESSION_USER",
    "SET",
    "SIMILAR",
    "SMALLINT",
    "SOME",
    // <- moved over from functions
    "SPECIFIC",
    "SQL",
    "SQLEXCEPTION",
    "SQLSTATE",
    "SQLWARNING",
    "START",
    "STATIC",
    "SUBMULTISET",
    "SYMMETRIC",
    "SYSTEM",
    "SYSTEM_USER",
    "TABLE",
    "TABLESAMPLE",
    "THEN",
    "TIME",
    "TIMESTAMP",
    "TIMEZONE_HOUR",
    "TIMEZONE_MINUTE",
    "TO",
    "TRAILING",
    "TRANSLATION",
    "TREAT",
    "TRIGGER",
    "TRUE",
    "UESCAPE",
    "UNION",
    "UNIQUE",
    "UNKNOWN",
    "UNNEST",
    "UPDATE",
    "USER",
    "USING",
    "VALUE",
    "VALUES",
    "VARBINARY",
    "VARCHAR",
    "VARYING",
    "WHENEVER",
    "WINDOW",
    "WITHIN",
    "WITHOUT",
    "YEAR"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/sql/sql.formatter.js
var reservedSelect12 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses12 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY [ALL | DISTINCT]",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  // Data manipulation
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET",
  // Data definition
  "CREATE [RECURSIVE] VIEW",
  "CREATE [GLOBAL TEMPORARY | LOCAL TEMPORARY] TABLE"
]);
var onelineClauses12 = expandPhrases([
  // - update:
  "UPDATE",
  "WHERE CURRENT OF",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE",
  // - alter table:
  "ALTER TABLE",
  "ADD COLUMN",
  "DROP [COLUMN]",
  "RENAME COLUMN",
  "RENAME TO",
  "ALTER [COLUMN]",
  "{SET | DROP} DEFAULT",
  // for alter column
  "ADD SCOPE",
  // for alter column
  "DROP SCOPE {CASCADE | RESTRICT}",
  // for alter column
  "RESTART WITH",
  // for alter column
  // - truncate:
  "TRUNCATE TABLE",
  // other
  "SET SCHEMA"
]);
var reservedSetOperations12 = expandPhrases(["UNION [ALL | DISTINCT]", "EXCEPT [ALL | DISTINCT]", "INTERSECT [ALL | DISTINCT]"]);
var reservedJoins12 = expandPhrases(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"]);
var reservedPhrases12 = expandPhrases(["ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]", "{ROWS | RANGE} BETWEEN"]);
var sql = {
  tokenizerOptions: {
    reservedSelect: reservedSelect12,
    reservedClauses: [...reservedClauses12, ...onelineClauses12],
    reservedSetOperations: reservedSetOperations12,
    reservedJoins: reservedJoins12,
    reservedPhrases: reservedPhrases12,
    reservedKeywords: keywords12,
    reservedFunctionNames: functions12,
    stringTypes: [{
      quote: "''-qq-bs",
      prefixes: ["N", "U&"]
    }, {
      quote: "''-raw",
      prefixes: ["X"],
      requirePrefix: true
    }],
    identTypes: [`""-qq`, "``"],
    paramTypes: {
      positional: true
    },
    operators: ["||"]
  },
  formatOptions: {
    onelineClauses: onelineClauses12
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/trino/trino.functions.js
var functions13 = flatKeywordList({
  // https://github.com/trinodb/trino/tree/432d2897bdef99388c1a47188743a061c4ac1f34/docs/src/main/sphinx/functions
  // rg '^\.\. function::' ./docs/src/main/sphinx/functions | cut -d' ' -f 3 | cut -d '(' -f 1 | sort | uniq
  // rg '\* ' ./docs/src/main/sphinx/functions/list-by-topic.rst | grep    '\* :func:' | cut -d'`' -f 2
  // rg '\* ' ./docs/src/main/sphinx/functions/list-by-topic.rst | grep -v '\* :func:'
  // grep -e '^- ' ./docs/src/main/sphinx/functions/list.rst | grep  -e '^- :func:' | cut -d'`' -f2
  // grep -e '^- ' ./docs/src/main/sphinx/functions/list.rst | grep -ve '^- :func:'
  all: ["ABS", "ACOS", "ALL_MATCH", "ANY_MATCH", "APPROX_DISTINCT", "APPROX_MOST_FREQUENT", "APPROX_PERCENTILE", "APPROX_SET", "ARBITRARY", "ARRAYS_OVERLAP", "ARRAY_AGG", "ARRAY_DISTINCT", "ARRAY_EXCEPT", "ARRAY_INTERSECT", "ARRAY_JOIN", "ARRAY_MAX", "ARRAY_MIN", "ARRAY_POSITION", "ARRAY_REMOVE", "ARRAY_SORT", "ARRAY_UNION", "ASIN", "ATAN", "ATAN2", "AT_TIMEZONE", "AVG", "BAR", "BETA_CDF", "BING_TILE", "BING_TILES_AROUND", "BING_TILE_AT", "BING_TILE_COORDINATES", "BING_TILE_POLYGON", "BING_TILE_QUADKEY", "BING_TILE_ZOOM_LEVEL", "BITWISE_AND", "BITWISE_AND_AGG", "BITWISE_LEFT_SHIFT", "BITWISE_NOT", "BITWISE_OR", "BITWISE_OR_AGG", "BITWISE_RIGHT_SHIFT", "BITWISE_RIGHT_SHIFT_ARITHMETIC", "BITWISE_XOR", "BIT_COUNT", "BOOL_AND", "BOOL_OR", "CARDINALITY", "CAST", "CBRT", "CEIL", "CEILING", "CHAR2HEXINT", "CHECKSUM", "CHR", "CLASSIFY", "COALESCE", "CODEPOINT", "COLOR", "COMBINATIONS", "CONCAT", "CONCAT_WS", "CONTAINS", "CONTAINS_SEQUENCE", "CONVEX_HULL_AGG", "CORR", "COS", "COSH", "COSINE_SIMILARITY", "COUNT", "COUNT_IF", "COVAR_POP", "COVAR_SAMP", "CRC32", "CUME_DIST", "CURRENT_CATALOG", "CURRENT_DATE", "CURRENT_GROUPS", "CURRENT_SCHEMA", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_TIMEZONE", "CURRENT_USER", "DATE", "DATE_ADD", "DATE_DIFF", "DATE_FORMAT", "DATE_PARSE", "DATE_TRUNC", "DAY", "DAY_OF_MONTH", "DAY_OF_WEEK", "DAY_OF_YEAR", "DEGREES", "DENSE_RANK", "DOW", "DOY", "E", "ELEMENT_AT", "EMPTY_APPROX_SET", "EVALUATE_CLASSIFIER_PREDICTIONS", "EVERY", "EXP", "EXTRACT", "FEATURES", "FILTER", "FIRST_VALUE", "FLATTEN", "FLOOR", "FORMAT", "FORMAT_DATETIME", "FORMAT_NUMBER", "FROM_BASE", "FROM_BASE32", "FROM_BASE64", "FROM_BASE64URL", "FROM_BIG_ENDIAN_32", "FROM_BIG_ENDIAN_64", "FROM_ENCODED_POLYLINE", "FROM_GEOJSON_GEOMETRY", "FROM_HEX", "FROM_IEEE754_32", "FROM_IEEE754_64", "FROM_ISO8601_DATE", "FROM_ISO8601_TIMESTAMP", "FROM_ISO8601_TIMESTAMP_NANOS", "FROM_UNIXTIME", "FROM_UNIXTIME_NANOS", "FROM_UTF8", "GEOMETRIC_MEAN", "GEOMETRY_FROM_HADOOP_SHAPE", "GEOMETRY_INVALID_REASON", "GEOMETRY_NEAREST_POINTS", "GEOMETRY_TO_BING_TILES", "GEOMETRY_UNION", "GEOMETRY_UNION_AGG", "GREATEST", "GREAT_CIRCLE_DISTANCE", "HAMMING_DISTANCE", "HASH_COUNTS", "HISTOGRAM", "HMAC_MD5", "HMAC_SHA1", "HMAC_SHA256", "HMAC_SHA512", "HOUR", "HUMAN_READABLE_SECONDS", "IF", "INDEX", "INFINITY", "INTERSECTION_CARDINALITY", "INVERSE_BETA_CDF", "INVERSE_NORMAL_CDF", "IS_FINITE", "IS_INFINITE", "IS_JSON_SCALAR", "IS_NAN", "JACCARD_INDEX", "JSON_ARRAY_CONTAINS", "JSON_ARRAY_GET", "JSON_ARRAY_LENGTH", "JSON_EXISTS", "JSON_EXTRACT", "JSON_EXTRACT_SCALAR", "JSON_FORMAT", "JSON_PARSE", "JSON_QUERY", "JSON_SIZE", "JSON_VALUE", "KURTOSIS", "LAG", "LAST_DAY_OF_MONTH", "LAST_VALUE", "LEAD", "LEARN_CLASSIFIER", "LEARN_LIBSVM_CLASSIFIER", "LEARN_LIBSVM_REGRESSOR", "LEARN_REGRESSOR", "LEAST", "LENGTH", "LEVENSHTEIN_DISTANCE", "LINE_INTERPOLATE_POINT", "LINE_INTERPOLATE_POINTS", "LINE_LOCATE_POINT", "LISTAGG", "LN", "LOCALTIME", "LOCALTIMESTAMP", "LOG", "LOG10", "LOG2", "LOWER", "LPAD", "LTRIM", "LUHN_CHECK", "MAKE_SET_DIGEST", "MAP", "MAP_AGG", "MAP_CONCAT", "MAP_ENTRIES", "MAP_FILTER", "MAP_FROM_ENTRIES", "MAP_KEYS", "MAP_UNION", "MAP_VALUES", "MAP_ZIP_WITH", "MAX", "MAX_BY", "MD5", "MERGE", "MERGE_SET_DIGEST", "MILLISECOND", "MIN", "MINUTE", "MIN_BY", "MOD", "MONTH", "MULTIMAP_AGG", "MULTIMAP_FROM_ENTRIES", "MURMUR3", "NAN", "NGRAMS", "NONE_MATCH", "NORMALIZE", "NORMAL_CDF", "NOW", "NTH_VALUE", "NTILE", "NULLIF", "NUMERIC_HISTOGRAM", "OBJECTID", "OBJECTID_TIMESTAMP", "PARSE_DATA_SIZE", "PARSE_DATETIME", "PARSE_DURATION", "PERCENT_RANK", "PI", "POSITION", "POW", "POWER", "QDIGEST_AGG", "QUARTER", "RADIANS", "RAND", "RANDOM", "RANK", "REDUCE", "REDUCE_AGG", "REGEXP_COUNT", "REGEXP_EXTRACT", "REGEXP_EXTRACT_ALL", "REGEXP_LIKE", "REGEXP_POSITION", "REGEXP_REPLACE", "REGEXP_SPLIT", "REGRESS", "REGR_INTERCEPT", "REGR_SLOPE", "RENDER", "REPEAT", "REPLACE", "REVERSE", "RGB", "ROUND", "ROW_NUMBER", "RPAD", "RTRIM", "SECOND", "SEQUENCE", "SHA1", "SHA256", "SHA512", "SHUFFLE", "SIGN", "SIMPLIFY_GEOMETRY", "SIN", "SKEWNESS", "SLICE", "SOUNDEX", "SPATIAL_PARTITIONING", "SPATIAL_PARTITIONS", "SPLIT", "SPLIT_PART", "SPLIT_TO_MAP", "SPLIT_TO_MULTIMAP", "SPOOKY_HASH_V2_32", "SPOOKY_HASH_V2_64", "SQRT", "STARTS_WITH", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "STRPOS", "ST_AREA", "ST_ASBINARY", "ST_ASTEXT", "ST_BOUNDARY", "ST_BUFFER", "ST_CENTROID", "ST_CONTAINS", "ST_CONVEXHULL", "ST_COORDDIM", "ST_CROSSES", "ST_DIFFERENCE", "ST_DIMENSION", "ST_DISJOINT", "ST_DISTANCE", "ST_ENDPOINT", "ST_ENVELOPE", "ST_ENVELOPEASPTS", "ST_EQUALS", "ST_EXTERIORRING", "ST_GEOMETRIES", "ST_GEOMETRYFROMTEXT", "ST_GEOMETRYN", "ST_GEOMETRYTYPE", "ST_GEOMFROMBINARY", "ST_INTERIORRINGN", "ST_INTERIORRINGS", "ST_INTERSECTION", "ST_INTERSECTS", "ST_ISCLOSED", "ST_ISEMPTY", "ST_ISRING", "ST_ISSIMPLE", "ST_ISVALID", "ST_LENGTH", "ST_LINEFROMTEXT", "ST_LINESTRING", "ST_MULTIPOINT", "ST_NUMGEOMETRIES", "ST_NUMINTERIORRING", "ST_NUMPOINTS", "ST_OVERLAPS", "ST_POINT", "ST_POINTN", "ST_POINTS", "ST_POLYGON", "ST_RELATE", "ST_STARTPOINT", "ST_SYMDIFFERENCE", "ST_TOUCHES", "ST_UNION", "ST_WITHIN", "ST_X", "ST_XMAX", "ST_XMIN", "ST_Y", "ST_YMAX", "ST_YMIN", "SUBSTR", "SUBSTRING", "SUM", "TAN", "TANH", "TDIGEST_AGG", "TIMESTAMP_OBJECTID", "TIMEZONE_HOUR", "TIMEZONE_MINUTE", "TO_BASE", "TO_BASE32", "TO_BASE64", "TO_BASE64URL", "TO_BIG_ENDIAN_32", "TO_BIG_ENDIAN_64", "TO_CHAR", "TO_DATE", "TO_ENCODED_POLYLINE", "TO_GEOJSON_GEOMETRY", "TO_GEOMETRY", "TO_HEX", "TO_IEEE754_32", "TO_IEEE754_64", "TO_ISO8601", "TO_MILLISECONDS", "TO_SPHERICAL_GEOGRAPHY", "TO_TIMESTAMP", "TO_UNIXTIME", "TO_UTF8", "TRANSFORM", "TRANSFORM_KEYS", "TRANSFORM_VALUES", "TRANSLATE", "TRIM", "TRIM_ARRAY", "TRUNCATE", "TRY", "TRY_CAST", "TYPEOF", "UPPER", "URL_DECODE", "URL_ENCODE", "URL_EXTRACT_FRAGMENT", "URL_EXTRACT_HOST", "URL_EXTRACT_PARAMETER", "URL_EXTRACT_PATH", "URL_EXTRACT_PORT", "URL_EXTRACT_PROTOCOL", "URL_EXTRACT_QUERY", "UUID", "VALUES_AT_QUANTILES", "VALUE_AT_QUANTILE", "VARIANCE", "VAR_POP", "VAR_SAMP", "VERSION", "WEEK", "WEEK_OF_YEAR", "WIDTH_BUCKET", "WILSON_INTERVAL_LOWER", "WILSON_INTERVAL_UPPER", "WITH_TIMEZONE", "WORD_STEM", "XXHASH64", "YEAR", "YEAR_OF_WEEK", "YOW", "ZIP", "ZIP_WITH"],
  // https://trino.io/docs/current/sql/match-recognize.html#row-pattern-recognition-expressions
  rowPattern: ["CLASSIFIER", "FIRST", "LAST", "MATCH_NUMBER", "NEXT", "PERMUTE", "PREV"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/trino/trino.keywords.js
var keywords13 = flatKeywordList({
  // https://github.com/trinodb/trino/blob/432d2897bdef99388c1a47188743a061c4ac1f34/core/trino-parser/src/main/antlr4/io/trino/sql/parser/SqlBase.g4#L858-L1128
  all: ["ABSENT", "ADD", "ADMIN", "AFTER", "ALL", "ALTER", "ANALYZE", "AND", "ANY", "ARRAY", "AS", "ASC", "AT", "AUTHORIZATION", "BERNOULLI", "BETWEEN", "BOTH", "BY", "CALL", "CASCADE", "CASE", "CATALOGS", "COLUMN", "COLUMNS", "COMMENT", "COMMIT", "COMMITTED", "CONDITIONAL", "CONSTRAINT", "COPARTITION", "CREATE", "CROSS", "CUBE", "CURRENT", "CURRENT_PATH", "CURRENT_ROLE", "DATA", "DEALLOCATE", "DEFAULT", "DEFINE", "DEFINER", "DELETE", "DENY", "DESC", "DESCRIBE", "DESCRIPTOR", "DISTINCT", "DISTRIBUTED", "DOUBLE", "DROP", "ELSE", "EMPTY", "ENCODING", "END", "ERROR", "ESCAPE", "EXCEPT", "EXCLUDING", "EXECUTE", "EXISTS", "EXPLAIN", "FALSE", "FETCH", "FINAL", "FIRST", "FOLLOWING", "FOR", "FROM", "FULL", "FUNCTIONS", "GRANT", "GRANTED", "GRANTS", "GRAPHVIZ", "GROUP", "GROUPING", "GROUPS", "HAVING", "IGNORE", "IN", "INCLUDING", "INITIAL", "INNER", "INPUT", "INSERT", "INTERSECT", "INTERVAL", "INTO", "INVOKER", "IO", "IS", "ISOLATION", "JOIN", "JSON", "JSON_ARRAY", "JSON_OBJECT", "KEEP", "KEY", "KEYS", "LAST", "LATERAL", "LEADING", "LEFT", "LEVEL", "LIKE", "LIMIT", "LOCAL", "LOGICAL", "MATCH", "MATCHED", "MATCHES", "MATCH_RECOGNIZE", "MATERIALIZED", "MEASURES", "NATURAL", "NEXT", "NFC", "NFD", "NFKC", "NFKD", "NO", "NONE", "NOT", "NULL", "NULLS", "OBJECT", "OF", "OFFSET", "OMIT", "ON", "ONE", "ONLY", "OPTION", "OR", "ORDER", "ORDINALITY", "OUTER", "OUTPUT", "OVER", "OVERFLOW", "PARTITION", "PARTITIONS", "PASSING", "PAST", "PATH", "PATTERN", "PER", "PERMUTE", "PRECEDING", "PRECISION", "PREPARE", "PRIVILEGES", "PROPERTIES", "PRUNE", "QUOTES", "RANGE", "READ", "RECURSIVE", "REFRESH", "RENAME", "REPEATABLE", "RESET", "RESPECT", "RESTRICT", "RETURNING", "REVOKE", "RIGHT", "ROLE", "ROLES", "ROLLBACK", "ROLLUP", "ROW", "ROWS", "RUNNING", "SCALAR", "SCHEMA", "SCHEMAS", "SECURITY", "SEEK", "SELECT", "SERIALIZABLE", "SESSION", "SET", "SETS", "SHOW", "SKIP", "SOME", "START", "STATS", "STRING", "SUBSET", "SYSTEM", "TABLE", "TABLES", "TABLESAMPLE", "TEXT", "THEN", "TIES", "TIME", "TIMESTAMP", "TO", "TRAILING", "TRANSACTION", "TRUE", "TYPE", "UESCAPE", "UNBOUNDED", "UNCOMMITTED", "UNCONDITIONAL", "UNION", "UNIQUE", "UNKNOWN", "UNMATCHED", "UNNEST", "UPDATE", "USE", "USER", "USING", "UTF16", "UTF32", "UTF8", "VALIDATE", "VALUE", "VALUES", "VERBOSE", "VIEW", "WHEN", "WHERE", "WINDOW", "WITH", "WITHIN", "WITHOUT", "WORK", "WRAPPER", "WRITE", "ZONE"],
  // https://github.com/trinodb/trino/blob/432d2897bdef99388c1a47188743a061c4ac1f34/core/trino-main/src/main/java/io/trino/metadata/TypeRegistry.java#L131-L168
  // or https://trino.io/docs/current/language/types.html
  types: ["BIGINT", "INT", "INTEGER", "SMALLINT", "TINYINT", "BOOLEAN", "DATE", "DECIMAL", "REAL", "DOUBLE", "HYPERLOGLOG", "QDIGEST", "TDIGEST", "P4HYPERLOGLOG", "INTERVAL", "TIMESTAMP", "TIME", "VARBINARY", "VARCHAR", "CHAR", "ROW", "ARRAY", "MAP", "JSON", "JSON2016", "IPADDRESS", "GEOMETRY", "UUID", "SETDIGEST", "JONIREGEXP", "RE2JREGEXP", "LIKEPATTERN", "COLOR", "CODEPOINTS", "FUNCTION", "JSONPATH"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/trino/trino.formatter.js
var reservedSelect13 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses13 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY [ALL | DISTINCT]",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  // Data manipulation
  // - insert:
  "INSERT INTO",
  "VALUES",
  // - update:
  "SET",
  // Data definition
  "CREATE [OR REPLACE] [MATERIALIZED] VIEW",
  "CREATE TABLE [IF NOT EXISTS]",
  // MATCH_RECOGNIZE
  "MATCH_RECOGNIZE",
  "MEASURES",
  "ONE ROW PER MATCH",
  "ALL ROWS PER MATCH",
  "AFTER MATCH",
  "PATTERN",
  "SUBSET",
  "DEFINE"
]);
var onelineClauses13 = expandPhrases([
  // - update:
  "UPDATE",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE [IF EXISTS]",
  "ADD COLUMN [IF NOT EXISTS]",
  "DROP COLUMN [IF EXISTS]",
  "RENAME COLUMN [IF EXISTS]",
  "RENAME TO",
  "SET AUTHORIZATION [USER | ROLE]",
  "SET PROPERTIES",
  "EXECUTE",
  // - truncate:
  "TRUNCATE TABLE",
  // other
  "ALTER SCHEMA",
  "ALTER MATERIALIZED VIEW",
  "ALTER VIEW",
  "CREATE SCHEMA",
  "CREATE ROLE",
  "DROP SCHEMA",
  "DROP MATERIALIZED VIEW",
  "DROP VIEW",
  "DROP ROLE",
  // Auxiliary
  "EXPLAIN",
  "ANALYZE",
  "EXPLAIN ANALYZE",
  "EXPLAIN ANALYZE VERBOSE",
  "USE",
  "COMMENT ON TABLE",
  "COMMENT ON COLUMN",
  "DESCRIBE INPUT",
  "DESCRIBE OUTPUT",
  "REFRESH MATERIALIZED VIEW",
  "RESET SESSION",
  "SET SESSION",
  "SET PATH",
  "SET TIME ZONE",
  "SHOW GRANTS",
  "SHOW CREATE TABLE",
  "SHOW CREATE SCHEMA",
  "SHOW CREATE VIEW",
  "SHOW CREATE MATERIALIZED VIEW",
  "SHOW TABLES",
  "SHOW SCHEMAS",
  "SHOW CATALOGS",
  "SHOW COLUMNS",
  "SHOW STATS FOR",
  "SHOW ROLES",
  "SHOW CURRENT ROLES",
  "SHOW ROLE GRANTS",
  "SHOW FUNCTIONS",
  "SHOW SESSION"
]);
var reservedSetOperations13 = expandPhrases(["UNION [ALL | DISTINCT]", "EXCEPT [ALL | DISTINCT]", "INTERSECT [ALL | DISTINCT]"]);
var reservedJoins13 = expandPhrases(["JOIN", "{LEFT | RIGHT | FULL} [OUTER] JOIN", "{INNER | CROSS} JOIN", "NATURAL [INNER] JOIN", "NATURAL {LEFT | RIGHT | FULL} [OUTER] JOIN"]);
var reservedPhrases13 = expandPhrases([
  "{ROWS | RANGE | GROUPS} BETWEEN",
  // comparison operator
  "IS [NOT] DISTINCT FROM"
]);
var trino = {
  tokenizerOptions: {
    reservedSelect: reservedSelect13,
    reservedClauses: [...reservedClauses13, ...onelineClauses13],
    reservedSetOperations: reservedSetOperations13,
    reservedJoins: reservedJoins13,
    reservedPhrases: reservedPhrases13,
    reservedKeywords: keywords13,
    reservedFunctionNames: functions13,
    // Trino also supports {- ... -} parenthesis.
    // The formatting of these currently works out as a result of { and -
    // not getting a space added in-between.
    // https://trino.io/docs/current/sql/match-recognize.html#row-pattern-syntax
    extraParens: ["[]", "{}"],
    // https://trino.io/docs/current/language/types.html#string
    // https://trino.io/docs/current/language/types.html#varbinary
    stringTypes: [{
      quote: "''-qq",
      prefixes: ["U&"]
    }, {
      quote: "''-raw",
      prefixes: ["X"],
      requirePrefix: true
    }],
    // https://trino.io/docs/current/language/reserved.html
    identTypes: ['""-qq'],
    paramTypes: {
      positional: true
    },
    operators: [
      "%",
      "->",
      "=>",
      ":",
      "||",
      // Row pattern syntax
      "|",
      "^",
      "$"
      // '?', conflicts with positional placeholders
    ]
  },
  formatOptions: {
    onelineClauses: onelineClauses13
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/transactsql/transactsql.functions.js
var functions14 = flatKeywordList({
  // https://docs.microsoft.com/en-us/sql/t-sql/functions/functions?view=sql-server-ver15
  aggregate: ["APPROX_COUNT_DISTINCT", "AVG", "CHECKSUM_AGG", "COUNT", "COUNT_BIG", "GROUPING", "GROUPING_ID", "MAX", "MIN", "STDEV", "STDEVP", "SUM", "VAR", "VARP"],
  analytic: ["CUME_DIST", "FIRST_VALUE", "LAG", "LAST_VALUE", "LEAD", "PERCENTILE_CONT", "PERCENTILE_DISC", "PERCENT_RANK", "Collation - COLLATIONPROPERTY", "Collation - TERTIARY_WEIGHTS"],
  configuration: ["@@DBTS", "@@LANGID", "@@LANGUAGE", "@@LOCK_TIMEOUT", "@@MAX_CONNECTIONS", "@@MAX_PRECISION", "@@NESTLEVEL", "@@OPTIONS", "@@REMSERVER", "@@SERVERNAME", "@@SERVICENAME", "@@SPID", "@@TEXTSIZE", "@@VERSION"],
  conversion: ["CAST", "CONVERT", "PARSE", "TRY_CAST", "TRY_CONVERT", "TRY_PARSE"],
  cryptographic: ["ASYMKEY_ID", "ASYMKEYPROPERTY", "CERTPROPERTY", "CERT_ID", "CRYPT_GEN_RANDOM", "DECRYPTBYASYMKEY", "DECRYPTBYCERT", "DECRYPTBYKEY", "DECRYPTBYKEYAUTOASYMKEY", "DECRYPTBYKEYAUTOCERT", "DECRYPTBYPASSPHRASE", "ENCRYPTBYASYMKEY", "ENCRYPTBYCERT", "ENCRYPTBYKEY", "ENCRYPTBYPASSPHRASE", "HASHBYTES", "IS_OBJECTSIGNED", "KEY_GUID", "KEY_ID", "KEY_NAME", "SIGNBYASYMKEY", "SIGNBYCERT", "SYMKEYPROPERTY", "VERIFYSIGNEDBYCERT", "VERIFYSIGNEDBYASYMKEY"],
  cursor: ["@@CURSOR_ROWS", "@@FETCH_STATUS", "CURSOR_STATUS"],
  dataType: ["DATALENGTH", "IDENT_CURRENT", "IDENT_INCR", "IDENT_SEED", "IDENTITY", "SQL_VARIANT_PROPERTY"],
  datetime: ["@@DATEFIRST", "CURRENT_TIMESTAMP", "CURRENT_TIMEZONE", "CURRENT_TIMEZONE_ID", "DATEADD", "DATEDIFF", "DATEDIFF_BIG", "DATEFROMPARTS", "DATENAME", "DATEPART", "DATETIME2FROMPARTS", "DATETIMEFROMPARTS", "DATETIMEOFFSETFROMPARTS", "DAY", "EOMONTH", "GETDATE", "GETUTCDATE", "ISDATE", "MONTH", "SMALLDATETIMEFROMPARTS", "SWITCHOFFSET", "SYSDATETIME", "SYSDATETIMEOFFSET", "SYSUTCDATETIME", "TIMEFROMPARTS", "TODATETIMEOFFSET", "YEAR", "JSON", "ISJSON", "JSON_VALUE", "JSON_QUERY", "JSON_MODIFY"],
  mathematical: ["ABS", "ACOS", "ASIN", "ATAN", "ATN2", "CEILING", "COS", "COT", "DEGREES", "EXP", "FLOOR", "LOG", "LOG10", "PI", "POWER", "RADIANS", "RAND", "ROUND", "SIGN", "SIN", "SQRT", "SQUARE", "TAN", "CHOOSE", "GREATEST", "IIF", "LEAST"],
  metadata: ["@@PROCID", "APP_NAME", "APPLOCK_MODE", "APPLOCK_TEST", "ASSEMBLYPROPERTY", "COL_LENGTH", "COL_NAME", "COLUMNPROPERTY", "DATABASEPROPERTYEX", "DB_ID", "DB_NAME", "FILE_ID", "FILE_IDEX", "FILE_NAME", "FILEGROUP_ID", "FILEGROUP_NAME", "FILEGROUPPROPERTY", "FILEPROPERTY", "FILEPROPERTYEX", "FULLTEXTCATALOGPROPERTY", "FULLTEXTSERVICEPROPERTY", "INDEX_COL", "INDEXKEY_PROPERTY", "INDEXPROPERTY", "NEXT VALUE FOR", "OBJECT_DEFINITION", "OBJECT_ID", "OBJECT_NAME", "OBJECT_SCHEMA_NAME", "OBJECTPROPERTY", "OBJECTPROPERTYEX", "ORIGINAL_DB_NAME", "PARSENAME", "SCHEMA_ID", "SCHEMA_NAME", "SCOPE_IDENTITY", "SERVERPROPERTY", "STATS_DATE", "TYPE_ID", "TYPE_NAME", "TYPEPROPERTY"],
  ranking: ["DENSE_RANK", "NTILE", "RANK", "ROW_NUMBER", "PUBLISHINGSERVERNAME"],
  security: ["CERTENCODED", "CERTPRIVATEKEY", "CURRENT_USER", "DATABASE_PRINCIPAL_ID", "HAS_DBACCESS", "HAS_PERMS_BY_NAME", "IS_MEMBER", "IS_ROLEMEMBER", "IS_SRVROLEMEMBER", "LOGINPROPERTY", "ORIGINAL_LOGIN", "PERMISSIONS", "PWDENCRYPT", "PWDCOMPARE", "SESSION_USER", "SESSIONPROPERTY", "SUSER_ID", "SUSER_NAME", "SUSER_SID", "SUSER_SNAME", "SYSTEM_USER", "USER", "USER_ID", "USER_NAME"],
  string: ["ASCII", "CHAR", "CHARINDEX", "CONCAT", "CONCAT_WS", "DIFFERENCE", "FORMAT", "LEFT", "LEN", "LOWER", "LTRIM", "NCHAR", "PATINDEX", "QUOTENAME", "REPLACE", "REPLICATE", "REVERSE", "RIGHT", "RTRIM", "SOUNDEX", "SPACE", "STR", "STRING_AGG", "STRING_ESCAPE", "STUFF", "SUBSTRING", "TRANSLATE", "TRIM", "UNICODE", "UPPER"],
  system: ["$PARTITION", "@@ERROR", "@@IDENTITY", "@@PACK_RECEIVED", "@@ROWCOUNT", "@@TRANCOUNT", "BINARY_CHECKSUM", "CHECKSUM", "COMPRESS", "CONNECTIONPROPERTY", "CONTEXT_INFO", "CURRENT_REQUEST_ID", "CURRENT_TRANSACTION_ID", "DECOMPRESS", "ERROR_LINE", "ERROR_MESSAGE", "ERROR_NUMBER", "ERROR_PROCEDURE", "ERROR_SEVERITY", "ERROR_STATE", "FORMATMESSAGE", "GET_FILESTREAM_TRANSACTION_CONTEXT", "GETANSINULL", "HOST_ID", "HOST_NAME", "ISNULL", "ISNUMERIC", "MIN_ACTIVE_ROWVERSION", "NEWID", "NEWSEQUENTIALID", "ROWCOUNT_BIG", "SESSION_CONTEXT", "XACT_STATE"],
  statistical: ["@@CONNECTIONS", "@@CPU_BUSY", "@@IDLE", "@@IO_BUSY", "@@PACK_SENT", "@@PACKET_ERRORS", "@@TIMETICKS", "@@TOTAL_ERRORS", "@@TOTAL_READ", "@@TOTAL_WRITE", "TEXTPTR", "TEXTVALID"],
  trigger: ["COLUMNS_UPDATED", "EVENTDATA", "TRIGGER_NESTLEVEL", "UPDATE"],
  // Shorthand functions to use in place of CASE expression
  caseAbbrev: ["COALESCE", "NULLIF"],
  // Parameterized types
  // https://docs.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql?view=sql-server-ver15
  dataTypes: ["DECIMAL", "NUMERIC", "FLOAT", "REAL", "DATETIME2", "DATETIMEOFFSET", "TIME", "CHAR", "VARCHAR", "NCHAR", "NVARCHAR", "BINARY", "VARBINARY"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/transactsql/transactsql.keywords.js
var keywords14 = flatKeywordList({
  // https://docs.microsoft.com/en-us/sql/t-sql/language-elements/reserved-keywords-transact-sql?view=sql-server-ver15
  standard: ["ADD", "ALL", "ALTER", "AND", "ANY", "AS", "ASC", "AUTHORIZATION", "BACKUP", "BEGIN", "BETWEEN", "BREAK", "BROWSE", "BULK", "BY", "CASCADE", "CHECK", "CHECKPOINT", "CLOSE", "CLUSTERED", "COALESCE", "COLLATE", "COLUMN", "COMMIT", "COMPUTE", "CONSTRAINT", "CONTAINS", "CONTAINSTABLE", "CONTINUE", "CONVERT", "CREATE", "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATABASE", "DBCC", "DEALLOCATE", "DECLARE", "DEFAULT", "DELETE", "DENY", "DESC", "DISK", "DISTINCT", "DISTRIBUTED", "DOUBLE", "DROP", "DUMP", "ERRLVL", "ESCAPE", "EXEC", "EXECUTE", "EXISTS", "EXIT", "EXTERNAL", "FETCH", "FILE", "FILLFACTOR", "FOR", "FOREIGN", "FREETEXT", "FREETEXTTABLE", "FROM", "FULL", "FUNCTION", "GOTO", "GRANT", "GROUP", "HAVING", "HOLDLOCK", "IDENTITY", "IDENTITYCOL", "IDENTITY_INSERT", "IF", "IN", "INDEX", "INNER", "INSERT", "INTERSECT", "INTO", "IS", "JOIN", "KEY", "KILL", "LEFT", "LIKE", "LINENO", "LOAD", "MERGE", "NATIONAL", "NOCHECK", "NONCLUSTERED", "NOT", "NULL", "NULLIF", "OF", "OFF", "OFFSETS", "ON", "OPEN", "OPENDATASOURCE", "OPENQUERY", "OPENROWSET", "OPENXML", "OPTION", "OR", "ORDER", "OUTER", "OVER", "PERCENT", "PIVOT", "PLAN", "PRECISION", "PRIMARY", "PRINT", "PROC", "PROCEDURE", "PUBLIC", "RAISERROR", "READ", "READTEXT", "RECONFIGURE", "REFERENCES", "REPLICATION", "RESTORE", "RESTRICT", "RETURN", "REVERT", "REVOKE", "RIGHT", "ROLLBACK", "ROWCOUNT", "ROWGUIDCOL", "RULE", "SAVE", "SCHEMA", "SECURITYAUDIT", "SELECT", "SEMANTICKEYPHRASETABLE", "SEMANTICSIMILARITYDETAILSTABLE", "SEMANTICSIMILARITYTABLE", "SESSION_USER", "SET", "SETUSER", "SHUTDOWN", "SOME", "STATISTICS", "SYSTEM_USER", "TABLE", "TABLESAMPLE", "TEXTSIZE", "THEN", "TO", "TOP", "TRAN", "TRANSACTION", "TRIGGER", "TRUNCATE", "TRY_CONVERT", "TSEQUAL", "UNION", "UNIQUE", "UNPIVOT", "UPDATE", "UPDATETEXT", "USE", "USER", "VALUES", "VARYING", "VIEW", "WAITFOR", "WHERE", "WHILE", "WITH", "WITHIN GROUP", "WRITETEXT"],
  odbc: ["ABSOLUTE", "ACTION", "ADA", "ADD", "ALL", "ALLOCATE", "ALTER", "AND", "ANY", "ARE", "AS", "ASC", "ASSERTION", "AT", "AUTHORIZATION", "AVG", "BEGIN", "BETWEEN", "BIT", "BIT_LENGTH", "BOTH", "BY", "CASCADE", "CASCADED", "CAST", "CATALOG", "CHAR", "CHARACTER", "CHARACTER_LENGTH", "CHAR_LENGTH", "CHECK", "CLOSE", "COALESCE", "COLLATE", "COLLATION", "COLUMN", "COMMIT", "CONNECT", "CONNECTION", "CONSTRAINT", "CONSTRAINTS", "CONTINUE", "CONVERT", "CORRESPONDING", "COUNT", "CREATE", "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "DATE", "DAY", "DEALLOCATE", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DEFERRABLE", "DEFERRED", "DELETE", "DESC", "DESCRIBE", "DESCRIPTOR", "DIAGNOSTICS", "DISCONNECT", "DISTINCT", "DOMAIN", "DOUBLE", "DROP", "END-EXEC", "ESCAPE", "EXCEPTION", "EXEC", "EXECUTE", "EXISTS", "EXTERNAL", "EXTRACT", "FALSE", "FETCH", "FIRST", "FLOAT", "FOR", "FOREIGN", "FORTRAN", "FOUND", "FROM", "FULL", "GET", "GLOBAL", "GO", "GOTO", "GRANT", "GROUP", "HAVING", "HOUR", "IDENTITY", "IMMEDIATE", "IN", "INCLUDE", "INDEX", "INDICATOR", "INITIALLY", "INNER", "INPUT", "INSENSITIVE", "INSERT", "INT", "INTEGER", "INTERSECT", "INTERVAL", "INTO", "IS", "ISOLATION", "JOIN", "KEY", "LANGUAGE", "LAST", "LEADING", "LEFT", "LEVEL", "LIKE", "LOCAL", "LOWER", "MATCH", "MAX", "MIN", "MINUTE", "MODULE", "MONTH", "NAMES", "NATIONAL", "NATURAL", "NCHAR", "NEXT", "NO", "NONE", "NOT", "NULL", "NULLIF", "NUMERIC", "OCTET_LENGTH", "OF", "ONLY", "OPEN", "OPTION", "OR", "ORDER", "OUTER", "OUTPUT", "OVERLAPS", "PAD", "PARTIAL", "PASCAL", "POSITION", "PRECISION", "PREPARE", "PRESERVE", "PRIMARY", "PRIOR", "PRIVILEGES", "PROCEDURE", "PUBLIC", "READ", "REAL", "REFERENCES", "RELATIVE", "RESTRICT", "REVOKE", "RIGHT", "ROLLBACK", "ROWS", "SCHEMA", "SCROLL", "SECOND", "SECTION", "SELECT", "SESSION", "SESSION_USER", "SET", "SIZE", "SMALLINT", "SOME", "SPACE", "SQL", "SQLCA", "SQLCODE", "SQLERROR", "SQLSTATE", "SQLWARNING", "SUBSTRING", "SUM", "SYSTEM_USER", "TABLE", "TEMPORARY", "TIME", "TIMESTAMP", "TIMEZONE_HOUR", "TIMEZONE_MINUTE", "TO", "TRAILING", "TRANSACTION", "TRANSLATE", "TRANSLATION", "TRIM", "TRUE", "UNION", "UNIQUE", "UNKNOWN", "UPDATE", "UPPER", "USAGE", "USER", "VALUE", "VALUES", "VARCHAR", "VARYING", "VIEW", "WHENEVER", "WHERE", "WITH", "WORK", "WRITE", "YEAR", "ZONE"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/transactsql/transactsql.formatter.js
var reservedSelect14 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses14 = expandPhrases([
  // queries
  "WITH",
  "INTO",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "WINDOW",
  "PARTITION BY",
  "ORDER BY",
  "OFFSET",
  "FETCH {FIRST | NEXT}",
  // Data manipulation
  // - insert:
  "INSERT [INTO]",
  "VALUES",
  // - update:
  "SET",
  // - merge:
  "MERGE [INTO]",
  "WHEN [NOT] MATCHED [BY TARGET | BY SOURCE] [THEN]",
  "UPDATE SET",
  // Data definition
  "CREATE [OR ALTER] [MATERIALIZED] VIEW",
  "CREATE TABLE",
  "CREATE [OR ALTER] {PROC | PROCEDURE}"
]);
var onelineClauses14 = expandPhrases([
  // - update:
  "UPDATE",
  "WHERE CURRENT OF",
  // - delete:
  "DELETE [FROM]",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE",
  "ADD",
  "DROP COLUMN [IF EXISTS]",
  "ALTER COLUMN",
  // - truncate:
  "TRUNCATE TABLE",
  // https://docs.microsoft.com/en-us/sql/t-sql/statements/statements?view=sql-server-ver15
  "ADD SENSITIVITY CLASSIFICATION",
  "ADD SIGNATURE",
  "AGGREGATE",
  "ANSI_DEFAULTS",
  "ANSI_NULLS",
  "ANSI_NULL_DFLT_OFF",
  "ANSI_NULL_DFLT_ON",
  "ANSI_PADDING",
  "ANSI_WARNINGS",
  "APPLICATION ROLE",
  "ARITHABORT",
  "ARITHIGNORE",
  "ASSEMBLY",
  "ASYMMETRIC KEY",
  "AUTHORIZATION",
  "AVAILABILITY GROUP",
  "BACKUP",
  "BACKUP CERTIFICATE",
  "BACKUP MASTER KEY",
  "BACKUP SERVICE MASTER KEY",
  "BEGIN CONVERSATION TIMER",
  "BEGIN DIALOG CONVERSATION",
  "BROKER PRIORITY",
  "BULK INSERT",
  "CERTIFICATE",
  "CLOSE MASTER KEY",
  "CLOSE SYMMETRIC KEY",
  "COLLATE",
  "COLUMN ENCRYPTION KEY",
  "COLUMN MASTER KEY",
  "COLUMNSTORE INDEX",
  "CONCAT_NULL_YIELDS_NULL",
  "CONTEXT_INFO",
  "CONTRACT",
  "CREDENTIAL",
  "CRYPTOGRAPHIC PROVIDER",
  "CURSOR_CLOSE_ON_COMMIT",
  "DATABASE",
  "DATABASE AUDIT SPECIFICATION",
  "DATABASE ENCRYPTION KEY",
  "DATABASE HADR",
  "DATABASE SCOPED CONFIGURATION",
  "DATABASE SCOPED CREDENTIAL",
  "DATABASE SET",
  "DATEFIRST",
  "DATEFORMAT",
  "DEADLOCK_PRIORITY",
  "DENY",
  "DENY XML",
  "DISABLE TRIGGER",
  "ENABLE TRIGGER",
  "END CONVERSATION",
  "ENDPOINT",
  "EVENT NOTIFICATION",
  "EVENT SESSION",
  "EXECUTE AS",
  "EXTERNAL DATA SOURCE",
  "EXTERNAL FILE FORMAT",
  "EXTERNAL LANGUAGE",
  "EXTERNAL LIBRARY",
  "EXTERNAL RESOURCE POOL",
  "EXTERNAL TABLE",
  "FIPS_FLAGGER",
  "FMTONLY",
  "FORCEPLAN",
  "FULLTEXT CATALOG",
  "FULLTEXT INDEX",
  "FULLTEXT STOPLIST",
  "FUNCTION",
  "GET CONVERSATION GROUP",
  "GET_TRANSMISSION_STATUS",
  "GRANT",
  "GRANT XML",
  "IDENTITY_INSERT",
  "IMPLICIT_TRANSACTIONS",
  "INDEX",
  "LANGUAGE",
  "LOCK_TIMEOUT",
  "LOGIN",
  "MASTER KEY",
  "MESSAGE TYPE",
  "MOVE CONVERSATION",
  "NOCOUNT",
  "NOEXEC",
  "NUMERIC_ROUNDABORT",
  "OFFSETS",
  "OPEN MASTER KEY",
  "OPEN SYMMETRIC KEY",
  "PARSEONLY",
  "PARTITION FUNCTION",
  "PARTITION SCHEME",
  "PROCEDURE",
  "QUERY_GOVERNOR_COST_LIMIT",
  "QUEUE",
  "QUOTED_IDENTIFIER",
  "RECEIVE",
  "REMOTE SERVICE BINDING",
  "REMOTE_PROC_TRANSACTIONS",
  "RESOURCE GOVERNOR",
  "RESOURCE POOL",
  "RESTORE",
  "RESTORE FILELISTONLY",
  "RESTORE HEADERONLY",
  "RESTORE LABELONLY",
  "RESTORE MASTER KEY",
  "RESTORE REWINDONLY",
  "RESTORE SERVICE MASTER KEY",
  "RESTORE VERIFYONLY",
  "REVERT",
  "REVOKE",
  "REVOKE XML",
  "ROLE",
  "ROUTE",
  "ROWCOUNT",
  "RULE",
  "SCHEMA",
  "SEARCH PROPERTY LIST",
  "SECURITY POLICY",
  "SELECTIVE XML INDEX",
  "SEND",
  "SENSITIVITY CLASSIFICATION",
  "SEQUENCE",
  "SERVER AUDIT",
  "SERVER AUDIT SPECIFICATION",
  "SERVER CONFIGURATION",
  "SERVER ROLE",
  "SERVICE",
  "SERVICE MASTER KEY",
  "SETUSER",
  "SHOWPLAN_ALL",
  "SHOWPLAN_TEXT",
  "SHOWPLAN_XML",
  "SIGNATURE",
  "SPATIAL INDEX",
  "STATISTICS",
  "STATISTICS IO",
  "STATISTICS PROFILE",
  "STATISTICS TIME",
  "STATISTICS XML",
  "SYMMETRIC KEY",
  "SYNONYM",
  "TABLE",
  "TABLE IDENTITY",
  "TEXTSIZE",
  "TRANSACTION ISOLATION LEVEL",
  "TRIGGER",
  "TYPE",
  "UPDATE STATISTICS",
  "USER",
  "WORKLOAD GROUP",
  "XACT_ABORT",
  "XML INDEX",
  "XML SCHEMA COLLECTION"
]);
var reservedSetOperations14 = expandPhrases(["UNION [ALL]", "EXCEPT", "INTERSECT"]);
var reservedJoins14 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  // non-standard joins
  "{CROSS | OUTER} APPLY"
]);
var reservedPhrases14 = expandPhrases(["ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]", "{ROWS | RANGE} BETWEEN"]);
var transactsql = {
  tokenizerOptions: {
    reservedSelect: reservedSelect14,
    reservedClauses: [...reservedClauses14, ...onelineClauses14],
    reservedSetOperations: reservedSetOperations14,
    reservedJoins: reservedJoins14,
    reservedPhrases: reservedPhrases14,
    reservedKeywords: keywords14,
    reservedFunctionNames: functions14,
    nestedBlockComments: true,
    stringTypes: [{
      quote: "''-qq",
      prefixes: ["N"]
    }],
    identTypes: [`""-qq`, "[]"],
    identChars: {
      first: "#@",
      rest: "#@$"
    },
    paramTypes: {
      named: ["@"],
      quoted: ["@"]
    },
    operators: ["%", "&", "|", "^", "~", "!<", "!>", "+=", "-=", "*=", "/=", "%=", "|=", "&=", "^=", "::"]
    // TODO: Support for money constants
  },
  formatOptions: {
    alwaysDenseOperators: ["::"],
    onelineClauses: onelineClauses14
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/singlestoredb/singlestoredb.keywords.js
var keywords15 = flatKeywordList({
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/restricted-keywords/list-of-restricted-keywords.html
  all: ["ABORT", "ABSOLUTE", "ACCESS", "ACCESSIBLE", "ACCOUNT", "ACTION", "ACTIVE", "ADD", "ADMIN", "AFTER", "AGAINST", "AGGREGATE", "AGGREGATES", "AGGREGATOR", "AGGREGATOR_ID", "AGGREGATOR_PLAN_HASH", "AGGREGATORS", "ALGORITHM", "ALL", "ALSO", "ALTER", "ALWAYS", "ANALYZE", "AND", "ANY", "ARGHISTORY", "ARRANGE", "ARRANGEMENT", "ARRAY", "AS", "ASC", "ASCII", "ASENSITIVE", "ASM", "ASSERTION", "ASSIGNMENT", "AST", "ASYMMETRIC", "ASYNC", "AT", "ATTACH", "ATTRIBUTE", "AUTHORIZATION", "AUTO", "AUTO_INCREMENT", "AUTO_REPROVISION", "AUTOSTATS", "AUTOSTATS_CARDINALITY_MODE", "AUTOSTATS_ENABLED", "AUTOSTATS_HISTOGRAM_MODE", "AUTOSTATS_SAMPLING", "AVAILABILITY", "AVG", "AVG_ROW_LENGTH", "AVRO", "AZURE", "BACKGROUND", "_BACKGROUND_THREADS_FOR_CLEANUP", "BACKUP", "BACKUP_HISTORY", "BACKUP_ID", "BACKWARD", "BATCH", "BATCHES", "BATCH_INTERVAL", "_BATCH_SIZE_LIMIT", "BEFORE", "BEGIN", "BETWEEN", "BIGINT", "BINARY", "_BINARY", "BIT", "BLOB", "BOOL", "BOOLEAN", "BOOTSTRAP", "BOTH", "_BT", "BTREE", "BUCKET_COUNT", "BUCKETS", "BY", "BYTE", "BYTE_LENGTH", "CACHE", "CALL", "CALL_FOR_PIPELINE", "CALLED", "CAPTURE", "CASCADE", "CASCADED", "CASE", "CATALOG", "CHAIN", "CHANGE", "CHAR", "CHARACTER", "CHARACTERISTICS", "CHARSET", "CHECK", "CHECKPOINT", "_CHECK_CAN_CONNECT", "_CHECK_CONSISTENCY", "CHECKSUM", "_CHECKSUM", "CLASS", "CLEAR", "CLIENT", "CLIENT_FOUND_ROWS", "CLOSE", "CLUSTER", "CLUSTERED", "CNF", "COALESCE", "COLLATE", "COLLATION", "COLUMN", "COLUMNAR", "COLUMNS", "COLUMNSTORE", "COLUMNSTORE_SEGMENT_ROWS", "COMMENT", "COMMENTS", "COMMIT", "COMMITTED", "_COMMIT_LOG_TAIL", "COMPACT", "COMPILE", "COMPRESSED", "COMPRESSION", "CONCURRENT", "CONCURRENTLY", "CONDITION", "CONFIGURATION", "CONNECTION", "CONNECTIONS", "CONFIG", "CONSTRAINT", "CONTAINS", "CONTENT", "CONTINUE", "_CONTINUE_REPLAY", "CONVERSION", "CONVERT", "COPY", "_CORE", "COST", "CREATE", "CREDENTIALS", "CROSS", "CUBE", "CSV", "CUME_DIST", "CURRENT", "CURRENT_CATALOG", "CURRENT_DATE", "CURRENT_SCHEMA", "CURRENT_SECURITY_GROUPS", "CURRENT_SECURITY_ROLES", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "CURSOR", "CYCLE", "DATA", "DATABASE", "DATABASES", "DATE", "DATETIME", "DAY", "DAY_HOUR", "DAY_MICROSECOND", "DAY_MINUTE", "DAY_SECOND", "DEALLOCATE", "DEC", "DECIMAL", "DECLARE", "DEFAULT", "DEFAULTS", "DEFERRABLE", "DEFERRED", "DEFINED", "DEFINER", "DELAYED", "DELAY_KEY_WRITE", "DELETE", "DELIMITER", "DELIMITERS", "DENSE_RANK", "DESC", "DESCRIBE", "DETACH", "DETERMINISTIC", "DICTIONARY", "DIFFERENTIAL", "DIRECTORY", "DISABLE", "DISCARD", "_DISCONNECT", "DISK", "DISTINCT", "DISTINCTROW", "DISTRIBUTED_JOINS", "DIV", "DO", "DOCUMENT", "DOMAIN", "DOUBLE", "DROP", "_DROP_PROFILE", "DUAL", "DUMP", "DUPLICATE", "DURABILITY", "DYNAMIC", "EARLIEST", "EACH", "ECHO", "ELECTION", "ELSE", "ELSEIF", "ENABLE", "ENCLOSED", "ENCODING", "ENCRYPTED", "END", "ENGINE", "ENGINES", "ENUM", "ERRORS", "ESCAPE", "ESCAPED", "ESTIMATE", "EVENT", "EVENTS", "EXCEPT", "EXCLUDE", "EXCLUDING", "EXCLUSIVE", "EXECUTE", "EXISTS", "EXIT", "EXPLAIN", "EXTENDED", "EXTENSION", "EXTERNAL", "EXTERNAL_HOST", "EXTERNAL_PORT", "EXTRACTOR", "EXTRACTORS", "EXTRA_JOIN", "_FAILOVER", "FAILED_LOGIN_ATTEMPTS", "FAILURE", "FALSE", "FAMILY", "FAULT", "FETCH", "FIELDS", "FILE", "FILES", "FILL", "FIX_ALTER", "FIXED", "FLOAT", "FLOAT4", "FLOAT8", "FLUSH", "FOLLOWING", "FOR", "FORCE", "FORCE_COMPILED_MODE", "FORCE_INTERPRETER_MODE", "FOREGROUND", "FOREIGN", "FORMAT", "FORWARD", "FREEZE", "FROM", "FS", "_FSYNC", "FULL", "FULLTEXT", "FUNCTION", "FUNCTIONS", "GC", "GCS", "GET_FORMAT", "_GC", "_GCX", "GENERATE", "GEOGRAPHY", "GEOGRAPHYPOINT", "GEOMETRY", "GEOMETRYPOINT", "GLOBAL", "_GLOBAL_VERSION_TIMESTAMP", "GRANT", "GRANTED", "GRANTS", "GROUP", "GROUPING", "GROUPS", "GZIP", "HANDLE", "HANDLER", "HARD_CPU_LIMIT_PERCENTAGE", "HASH", "HAS_TEMP_TABLES", "HAVING", "HDFS", "HEADER", "HEARTBEAT_NO_LOGGING", "HIGH_PRIORITY", "HISTOGRAM", "HOLD", "HOLDING", "HOST", "HOSTS", "HOUR", "HOUR_MICROSECOND", "HOUR_MINUTE", "HOUR_SECOND", "IDENTIFIED", "IDENTITY", "IF", "IGNORE", "ILIKE", "IMMEDIATE", "IMMUTABLE", "IMPLICIT", "IMPORT", "IN", "INCLUDING", "INCREMENT", "INCREMENTAL", "INDEX", "INDEXES", "INFILE", "INHERIT", "INHERITS", "_INIT_PROFILE", "INIT", "INITIALIZE", "INITIALLY", "INJECT", "INLINE", "INNER", "INOUT", "INPUT", "INSENSITIVE", "INSERT", "INSERT_METHOD", "INSTANCE", "INSTEAD", "IN", "INT", "INT1", "INT2", "INT3", "INT4", "INT8", "INTEGER", "_INTERNAL_DYNAMIC_TYPECAST", "INTERPRETER_MODE", "INTERSECT", "INTERVAL", "INTO", "INVOKER", "ISOLATION", "ITERATE", "JOIN", "JSON", "KAFKA", "KEY", "KEY_BLOCK_SIZE", "KEYS", "KILL", "KILLALL", "LABEL", "LAG", "LANGUAGE", "LARGE", "LAST", "LAST_VALUE", "LATERAL", "LATEST", "LC_COLLATE", "LC_CTYPE", "LEAD", "LEADING", "LEAF", "LEAKPROOF", "LEAVE", "LEAVES", "LEFT", "LEVEL", "LICENSE", "LIKE", "LIMIT", "LINES", "LISTEN", "LLVM", "LOADDATA_WHERE", "LOAD", "LOCAL", "LOCALTIME", "LOCALTIMESTAMP", "LOCATION", "LOCK", "LONG", "LONGBLOB", "LONGTEXT", "LOOP", "LOW_PRIORITY", "_LS", "LZ4", "MANAGEMENT", "_MANAGEMENT_THREAD", "MAPPING", "MASTER", "MATCH", "MATERIALIZED", "MAXVALUE", "MAX_CONCURRENCY", "MAX_ERRORS", "MAX_PARTITIONS_PER_BATCH", "MAX_QUEUE_DEPTH", "MAX_RETRIES_PER_BATCH_PARTITION", "MAX_ROWS", "MBC", "MPL", "MEDIUMBLOB", "MEDIUMINT", "MEDIUMTEXT", "MEMBER", "MEMORY", "MEMORY_PERCENTAGE", "_MEMSQL_TABLE_ID_LOOKUP", "MEMSQL", "MEMSQL_DESERIALIZE", "MEMSQL_IMITATING_KAFKA", "MEMSQL_SERIALIZE", "MERGE", "METADATA", "MICROSECOND", "MIDDLEINT", "MIN_ROWS", "MINUS", "MINUTE_MICROSECOND", "MINUTE_SECOND", "MINVALUE", "MOD", "MODE", "MODEL", "MODIFIES", "MODIFY", "MONTH", "MOVE", "MPL", "NAMES", "NAMED", "NAMESPACE", "NATIONAL", "NATURAL", "NCHAR", "NEXT", "NO", "NODE", "NONE", "NO_QUERY_REWRITE", "NOPARAM", "NOT", "NOTHING", "NOTIFY", "NOWAIT", "NO_WRITE_TO_BINLOG", "NO_QUERY_REWRITE", "NORELY", "NTH_VALUE", "NTILE", "NULL", "NULLCOLS", "NULLS", "NUMERIC", "NVARCHAR", "OBJECT", "OF", "OFF", "OFFLINE", "OFFSET", "OFFSETS", "OIDS", "ON", "ONLINE", "ONLY", "OPEN", "OPERATOR", "OPTIMIZATION", "OPTIMIZE", "OPTIMIZER", "OPTIMIZER_STATE", "OPTION", "OPTIONS", "OPTIONALLY", "OR", "ORDER", "ORDERED_SERIALIZE", "ORPHAN", "OUT", "OUT_OF_ORDER", "OUTER", "OUTFILE", "OVER", "OVERLAPS", "OVERLAY", "OWNED", "OWNER", "PACK_KEYS", "PAIRED", "PARSER", "PARQUET", "PARTIAL", "PARTITION", "PARTITION_ID", "PARTITIONING", "PARTITIONS", "PASSING", "PASSWORD", "PASSWORD_LOCK_TIME", "PAUSE", "_PAUSE_REPLAY", "PERIODIC", "PERSISTED", "PIPELINE", "PIPELINES", "PLACING", "PLAN", "PLANS", "PLANCACHE", "PLUGINS", "POOL", "POOLS", "PORT", "PRECEDING", "PRECISION", "PREPARE", "PRESERVE", "PRIMARY", "PRIOR", "PRIVILEGES", "PROCEDURAL", "PROCEDURE", "PROCEDURES", "PROCESS", "PROCESSLIST", "PROFILE", "PROFILES", "PROGRAM", "PROMOTE", "PROXY", "PURGE", "QUARTER", "QUERIES", "QUERY", "QUERY_TIMEOUT", "QUEUE", "RANGE", "RANK", "READ", "_READ", "READS", "REAL", "REASSIGN", "REBALANCE", "RECHECK", "RECORD", "RECURSIVE", "REDUNDANCY", "REDUNDANT", "REF", "REFERENCE", "REFERENCES", "REFRESH", "REGEXP", "REINDEX", "RELATIVE", "RELEASE", "RELOAD", "RELY", "REMOTE", "REMOVE", "RENAME", "REPAIR", "_REPAIR_TABLE", "REPEAT", "REPEATABLE", "_REPL", "_REPROVISIONING", "REPLACE", "REPLICA", "REPLICATE", "REPLICATING", "REPLICATION", "REQUIRE", "RESOURCE", "RESOURCE_POOL", "RESET", "RESTART", "RESTORE", "RESTRICT", "RESULT", "_RESURRECT", "RETRY", "RETURN", "RETURNING", "RETURNS", "REVERSE", "RG_POOL", "REVOKE", "RIGHT", "RIGHT_ANTI_JOIN", "RIGHT_SEMI_JOIN", "RIGHT_STRAIGHT_JOIN", "RLIKE", "ROLES", "ROLLBACK", "ROLLUP", "ROUTINE", "ROW", "ROW_COUNT", "ROW_FORMAT", "ROW_NUMBER", "ROWS", "ROWSTORE", "RULE", "_RPC", "RUNNING", "S3", "SAFE", "SAVE", "SAVEPOINT", "SCALAR", "SCHEMA", "SCHEMAS", "SCHEMA_BINDING", "SCROLL", "SEARCH", "SECOND", "SECOND_MICROSECOND", "SECURITY", "SELECT", "SEMI_JOIN", "_SEND_THREADS", "SENSITIVE", "SEPARATOR", "SEQUENCE", "SEQUENCES", "SERIAL", "SERIALIZABLE", "SERIES", "SERVICE_USER", "SERVER", "SESSION", "SESSION_USER", "SET", "SETOF", "SECURITY_LISTS_INTERSECT", "SHA", "SHARD", "SHARDED", "SHARDED_ID", "SHARE", "SHOW", "SHUTDOWN", "SIGNAL", "SIGNED", "SIMILAR", "SIMPLE", "SITE", "SKIP", "SKIPPED_BATCHES", "__SLEEP", "SMALLINT", "SNAPSHOT", "_SNAPSHOT", "_SNAPSHOTS", "SOFT_CPU_LIMIT_PERCENTAGE", "SOME", "SONAME", "SPARSE", "SPATIAL", "SPATIAL_CHECK_INDEX", "SPECIFIC", "SQL", "SQL_BIG_RESULT", "SQL_BUFFER_RESULT", "SQL_CACHE", "SQL_CALC_FOUND_ROWS", "SQLEXCEPTION", "SQL_MODE", "SQL_NO_CACHE", "SQL_NO_LOGGING", "SQL_SMALL_RESULT", "SQLSTATE", "SQLWARNING", "STDIN", "STDOUT", "STOP", "STORAGE", "STRAIGHT_JOIN", "STRICT", "STRING", "STRIP", "SUCCESS", "SUPER", "SYMMETRIC", "SYNC_SNAPSHOT", "SYNC", "_SYNC", "_SYNC2", "_SYNC_PARTITIONS", "_SYNC_SNAPSHOT", "SYNCHRONIZE", "SYSID", "SYSTEM", "TABLE", "TABLE_CHECKSUM", "TABLES", "TABLESPACE", "TAGS", "TARGET_SIZE", "TASK", "TEMP", "TEMPLATE", "TEMPORARY", "TEMPTABLE", "_TERM_BUMP", "TERMINATE", "TERMINATED", "TEXT", "THEN", "TIME", "TIMEOUT", "TIMESTAMP", "TIMESTAMPADD", "TIMESTAMPDIFF", "TIMEZONE", "TINYBLOB", "TINYINT", "TINYTEXT", "TO", "TRACELOGS", "TRADITIONAL", "TRAILING", "TRANSFORM", "TRANSACTION", "_TRANSACTIONS_EXPERIMENTAL", "TREAT", "TRIGGER", "TRIGGERS", "TRUE", "TRUNC", "TRUNCATE", "TRUSTED", "TWO_PHASE", "_TWOPCID", "TYPE", "TYPES", "UNBOUNDED", "UNCOMMITTED", "UNDEFINED", "UNDO", "UNENCRYPTED", "UNENFORCED", "UNHOLD", "UNICODE", "UNION", "UNIQUE", "_UNITTEST", "UNKNOWN", "UNLISTEN", "_UNLOAD", "UNLOCK", "UNLOGGED", "UNPIVOT", "UNSIGNED", "UNTIL", "UPDATE", "UPGRADE", "USAGE", "USE", "USER", "USERS", "USING", "UTC_DATE", "UTC_TIME", "UTC_TIMESTAMP", "_UTF8", "VACUUM", "VALID", "VALIDATE", "VALIDATOR", "VALUE", "VALUES", "VARBINARY", "VARCHAR", "VARCHARACTER", "VARIABLES", "VARIADIC", "VARYING", "VERBOSE", "VIEW", "VOID", "VOLATILE", "VOTING", "WAIT", "_WAKE", "WARNINGS", "WEEK", "WHEN", "WHERE", "WHILE", "WHITESPACE", "WINDOW", "WITH", "WITHOUT", "WITHIN", "_WM_HEARTBEAT", "WORK", "WORKLOAD", "WRAPPER", "WRITE", "XACT_ID", "XOR", "YEAR", "YEAR_MONTH", "YES", "ZEROFILL", "ZONE"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/singlestoredb/singlestoredb.functions.js
var functions15 = flatKeywordList({
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/vector-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/window-functions/window-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/string-functions/string-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/conditional-functions/conditional-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/numeric-functions/numeric-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/geospatial-functions/geospatial-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/json-functions/json-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/information-functions/information-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/aggregate-functions/aggregate-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/time-series-functions/time-series-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/identifier-generation-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/date-and-time-functions/date-and-time-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/distinct-count-estimation-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/full-text-search-functions/full-text-search-functions.html
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference/regular-expression-functions.html
  all: [
    "ABS",
    "ACOS",
    "ADDDATE",
    "ADDTIME",
    "AES_DECRYPT",
    "AES_ENCRYPT",
    "ANY_VALUE",
    "APPROX_COUNT_DISTINCT",
    "APPROX_COUNT_DISTINCT_ACCUMULATE",
    "APPROX_COUNT_DISTINCT_COMBINE",
    "APPROX_COUNT_DISTINCT_ESTIMATE",
    "APPROX_GEOGRAPHY_INTERSECTS",
    "APPROX_PERCENTILE",
    "ASCII",
    "ASIN",
    "ATAN",
    "ATAN2",
    "AVG",
    "BIN",
    "BINARY",
    "BIT_AND",
    "BIT_COUNT",
    "BIT_OR",
    "BIT_XOR",
    "CAST",
    "CEIL",
    "CEILING",
    "CHAR",
    "CHARACTER_LENGTH",
    "CHAR_LENGTH",
    "CHARSET",
    "COALESCE",
    "COERCIBILITY",
    "COLLATION",
    "COLLECT",
    "CONCAT",
    "CONCAT_WS",
    "CONNECTION_ID",
    "CONV",
    "CONVERT",
    "CONVERT_TZ",
    "COS",
    "COT",
    "COUNT",
    "CUME_DIST",
    "CURDATE",
    "CURRENT_DATE",
    "CURRENT_ROLE",
    "CURRENT_TIME",
    "CURRENT_TIMESTAMP",
    "CURRENT_USER",
    "CURTIME",
    "DATABASE",
    "DATE",
    "DATE_ADD",
    "DATEDIFF",
    "DATE_FORMAT",
    "DATE_SUB",
    "DATE_TRUNC",
    "DAY",
    "DAYNAME",
    "DAYOFMONTH",
    "DAYOFWEEK",
    "DAYOFYEAR",
    "DECODE",
    "DEFAULT",
    "DEGREES",
    "DENSE_RANK",
    "DIV",
    "DOT_PRODUCT",
    "ELT",
    "EUCLIDEAN_DISTANCE",
    "EXP",
    "EXTRACT",
    "FIELD",
    "FIRST",
    "FIRST_VALUE",
    "FLOOR",
    "FORMAT",
    "FOUND_ROWS",
    "FROM_BASE64",
    "FROM_DAYS",
    "FROM_UNIXTIME",
    "GEOGRAPHY_AREA",
    "GEOGRAPHY_CONTAINS",
    "GEOGRAPHY_DISTANCE",
    "GEOGRAPHY_INTERSECTS",
    "GEOGRAPHY_LATITUDE",
    "GEOGRAPHY_LENGTH",
    "GEOGRAPHY_LONGITUDE",
    "GEOGRAPHY_POINT",
    "GEOGRAPHY_WITHIN_DISTANCE",
    "GEOMETRY_AREA",
    "GEOMETRY_CONTAINS",
    "GEOMETRY_DISTANCE",
    "GEOMETRY_FILTER",
    "GEOMETRY_INTERSECTS",
    "GEOMETRY_LENGTH",
    "GEOMETRY_POINT",
    "GEOMETRY_WITHIN_DISTANCE",
    "GEOMETRY_X",
    "GEOMETRY_Y",
    "GREATEST",
    "GROUPING",
    "GROUP_CONCAT",
    "HEX",
    "HIGHLIGHT",
    "HOUR",
    "ICU_VERSION",
    "IF",
    "IFNULL",
    "INET_ATON",
    "INET_NTOA",
    "INET6_ATON",
    "INET6_NTOA",
    "INITCAP",
    "INSERT",
    "INSTR",
    "INTERVAL",
    "IS",
    "IS NULL",
    "JSON_AGG",
    "JSON_ARRAY_CONTAINS_DOUBLE",
    "JSON_ARRAY_CONTAINS_JSON",
    "JSON_ARRAY_CONTAINS_STRING",
    "JSON_ARRAY_PUSH_DOUBLE",
    "JSON_ARRAY_PUSH_JSON",
    "JSON_ARRAY_PUSH_STRING",
    "JSON_DELETE_KEY",
    "JSON_EXTRACT_DOUBLE",
    "JSON_EXTRACT_JSON",
    "JSON_EXTRACT_STRING",
    "JSON_EXTRACT_BIGINT",
    "JSON_GET_TYPE",
    "JSON_LENGTH",
    "JSON_SET_DOUBLE",
    "JSON_SET_JSON",
    "JSON_SET_STRING",
    "JSON_SPLICE_DOUBLE",
    "JSON_SPLICE_JSON",
    "JSON_SPLICE_STRING",
    "LAG",
    "LAST_DAY",
    "LAST_VALUE",
    "LCASE",
    "LEAD",
    "LEAST",
    "LEFT",
    "LENGTH",
    "LIKE",
    "LN",
    "LOCALTIME",
    "LOCALTIMESTAMP",
    "LOCATE",
    "LOG",
    "LOG10",
    "LOG2",
    "LPAD",
    "LTRIM",
    "MATCH",
    "MAX",
    "MD5",
    "MEDIAN",
    "MICROSECOND",
    "MIN",
    "MINUTE",
    "MOD",
    "MONTH",
    "MONTHNAME",
    "MONTHS_BETWEEN",
    "NOT",
    "NOW",
    "NTH_VALUE",
    "NTILE",
    "NULLIF",
    "OCTET_LENGTH",
    "PERCENT_RANK",
    "PERCENTILE_CONT",
    "PERCENTILE_DISC",
    "PI",
    "PIVOT",
    "POSITION",
    "POW",
    "POWER",
    "QUARTER",
    "QUOTE",
    "RADIANS",
    "RAND",
    "RANK",
    "REGEXP",
    "REPEAT",
    "REPLACE",
    "REVERSE",
    "RIGHT",
    "RLIKE",
    "ROUND",
    "ROW_COUNT",
    "ROW_NUMBER",
    "RPAD",
    "RTRIM",
    "SCALAR",
    "SCHEMA",
    "SEC_TO_TIME",
    "SHA1",
    "SHA2",
    "SIGMOID",
    "SIGN",
    "SIN",
    "SLEEP",
    "SPLIT",
    "SOUNDEX",
    "SOUNDS LIKE",
    "SOURCE_POS_WAIT",
    "SPACE",
    "SQRT",
    "STDDEV",
    "STDDEV_POP",
    "STDDEV_SAMP",
    "STR_TO_DATE",
    "SUBDATE",
    "SUBSTR",
    "SUBSTRING",
    "SUBSTRING_INDEX",
    "SUM",
    "SYS_GUID",
    "TAN",
    "TIME",
    "TIMEDIFF",
    "TIME_BUCKET",
    "TIME_FORMAT",
    "TIMESTAMP",
    "TIMESTAMPADD",
    "TIMESTAMPDIFF",
    "TIME_TO_SEC",
    "TO_BASE64",
    "TO_CHAR",
    "TO_DAYS",
    "TO_JSON",
    "TO_NUMBER",
    "TO_SECONDS",
    "TO_TIMESTAMP",
    "TRIM",
    "TRUNC",
    "TRUNCATE",
    "UCASE",
    "UNHEX",
    "UNIX_TIMESTAMP",
    "UPDATEXML",
    "UPPER",
    "USER",
    "UTC_DATE",
    "UTC_TIME",
    "UTC_TIMESTAMP",
    "UUID",
    "VALUES",
    "VARIANCE",
    "VAR_POP",
    "VAR_SAMP",
    "VECTOR_SUB",
    "VERSION",
    "WEEK",
    "WEEKDAY",
    "WEEKOFYEAR",
    "YEAR",
    // Data types with parameters
    // https://docs.singlestore.com/managed-service/en/reference/sql-reference/data-types.html
    "BIT",
    "TINYINT",
    "SMALLINT",
    "MEDIUMINT",
    "INT",
    "INTEGER",
    "BIGINT",
    "DECIMAL",
    "DEC",
    "NUMERIC",
    "FIXED",
    "FLOAT",
    "DOUBLE",
    "DOUBLE PRECISION",
    "REAL",
    "DATETIME",
    "TIMESTAMP",
    "TIME",
    "YEAR",
    "CHAR",
    "NATIONAL CHAR",
    "VARCHAR",
    "NATIONAL VARCHAR",
    "BINARY",
    "VARBINARY",
    "BLOB",
    "TEXT",
    "ENUM"
  ]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/singlestoredb/singlestoredb.formatter.js
var reservedSelect15 = expandPhrases(["SELECT [ALL | DISTINCT | DISTINCTROW]"]);
var reservedClauses15 = expandPhrases([
  // queries
  "WITH",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER BY",
  "LIMIT",
  "OFFSET",
  // Data manipulation
  // - insert:
  "INSERT [IGNORE] [INTO]",
  "VALUES",
  "REPLACE [INTO]",
  // - update:
  "SET",
  // Data definition
  "CREATE VIEW",
  "CREATE [ROWSTORE] [REFERENCE | TEMPORARY | GLOBAL TEMPORARY] TABLE [IF NOT EXISTS]",
  "CREATE [OR REPLACE] [TEMPORARY] PROCEDURE [IF NOT EXISTS]",
  "CREATE [OR REPLACE] [EXTERNAL] FUNCTION"
]);
var onelineClauses15 = expandPhrases([
  // - update:
  "UPDATE",
  // - delete:
  "DELETE [FROM]",
  // - drop table:
  "DROP [TEMPORARY] TABLE [IF EXISTS]",
  // - alter table:
  "ALTER [ONLINE] TABLE",
  "ADD [COLUMN]",
  "ADD [UNIQUE] {INDEX | KEY}",
  "DROP [COLUMN]",
  "MODIFY [COLUMN]",
  "CHANGE",
  "RENAME [TO | AS]",
  // - truncate:
  "TRUNCATE [TABLE]",
  // https://docs.singlestore.com/managed-service/en/reference/sql-reference.html
  "ADD AGGREGATOR",
  "ADD LEAF",
  "AGGREGATOR SET AS MASTER",
  "ALTER DATABASE",
  "ALTER PIPELINE",
  "ALTER RESOURCE POOL",
  "ALTER USER",
  "ALTER VIEW",
  "ANALYZE TABLE",
  "ATTACH DATABASE",
  "ATTACH LEAF",
  "ATTACH LEAF ALL",
  "BACKUP DATABASE",
  "BINLOG",
  "BOOTSTRAP AGGREGATOR",
  "CACHE INDEX",
  "CALL",
  "CHANGE",
  "CHANGE MASTER TO",
  "CHANGE REPLICATION FILTER",
  "CHANGE REPLICATION SOURCE TO",
  "CHECK BLOB CHECKSUM",
  "CHECK TABLE",
  "CHECKSUM TABLE",
  "CLEAR ORPHAN DATABASES",
  "CLONE",
  "COMMIT",
  "CREATE DATABASE",
  "CREATE GROUP",
  "CREATE INDEX",
  "CREATE LINK",
  "CREATE MILESTONE",
  "CREATE PIPELINE",
  "CREATE RESOURCE POOL",
  "CREATE ROLE",
  "CREATE USER",
  "DEALLOCATE PREPARE",
  "DESCRIBE",
  "DETACH DATABASE",
  "DETACH PIPELINE",
  "DROP DATABASE",
  "DROP FUNCTION",
  "DROP INDEX",
  "DROP LINK",
  "DROP PIPELINE",
  "DROP PROCEDURE",
  "DROP RESOURCE POOL",
  "DROP ROLE",
  "DROP USER",
  "DROP VIEW",
  "EXECUTE",
  "EXPLAIN",
  "FLUSH",
  "FORCE",
  "GRANT",
  "HANDLER",
  "HELP",
  "KILL CONNECTION",
  "KILLALL QUERIES",
  "LOAD DATA",
  "LOAD INDEX INTO CACHE",
  "LOAD XML",
  "LOCK INSTANCE FOR BACKUP",
  "LOCK TABLES",
  "MASTER_POS_WAIT",
  "OPTIMIZE TABLE",
  "PREPARE",
  "PURGE BINARY LOGS",
  "REBALANCE PARTITIONS",
  "RELEASE SAVEPOINT",
  "REMOVE AGGREGATOR",
  "REMOVE LEAF",
  "REPAIR TABLE",
  "REPLACE",
  "REPLICATE DATABASE",
  "RESET",
  "RESET MASTER",
  "RESET PERSIST",
  "RESET REPLICA",
  "RESET SLAVE",
  "RESTART",
  "RESTORE DATABASE",
  "RESTORE REDUNDANCY",
  "REVOKE",
  "ROLLBACK",
  "ROLLBACK TO SAVEPOINT",
  "SAVEPOINT",
  "SET CHARACTER SET",
  "SET DEFAULT ROLE",
  "SET NAMES",
  "SET PASSWORD",
  "SET RESOURCE GROUP",
  "SET ROLE",
  "SET TRANSACTION",
  "SHOW",
  "SHOW CHARACTER SET",
  "SHOW COLLATION",
  "SHOW COLUMNS",
  "SHOW CREATE DATABASE",
  "SHOW CREATE FUNCTION",
  "SHOW CREATE PIPELINE",
  "SHOW CREATE PROCEDURE",
  "SHOW CREATE TABLE",
  "SHOW CREATE USER",
  "SHOW CREATE VIEW",
  "SHOW DATABASES",
  "SHOW ENGINE",
  "SHOW ENGINES",
  "SHOW ERRORS",
  "SHOW FUNCTION CODE",
  "SHOW FUNCTION STATUS",
  "SHOW GRANTS",
  "SHOW INDEX",
  "SHOW MASTER STATUS",
  "SHOW OPEN TABLES",
  "SHOW PLUGINS",
  "SHOW PRIVILEGES",
  "SHOW PROCEDURE CODE",
  "SHOW PROCEDURE STATUS",
  "SHOW PROCESSLIST",
  "SHOW PROFILE",
  "SHOW PROFILES",
  "SHOW RELAYLOG EVENTS",
  "SHOW REPLICA STATUS",
  "SHOW REPLICAS",
  "SHOW SLAVE",
  "SHOW SLAVE HOSTS",
  "SHOW STATUS",
  "SHOW TABLE STATUS",
  "SHOW TABLES",
  "SHOW VARIABLES",
  "SHOW WARNINGS",
  "SHUTDOWN",
  "SNAPSHOT DATABASE",
  "SOURCE_POS_WAIT",
  "START GROUP_REPLICATION",
  "START PIPELINE",
  "START REPLICA",
  "START SLAVE",
  "START TRANSACTION",
  "STOP GROUP_REPLICATION",
  "STOP PIPELINE",
  "STOP REPLICA",
  "STOP REPLICATING",
  "STOP SLAVE",
  "TEST PIPELINE",
  "UNLOCK INSTANCE",
  "UNLOCK TABLES",
  "USE",
  "XA",
  // flow control
  "ITERATE",
  "LEAVE",
  "LOOP",
  "REPEAT",
  "RETURN",
  "WHILE"
]);
var reservedSetOperations15 = expandPhrases(["UNION [ALL | DISTINCT]", "EXCEPT", "INTERSECT", "MINUS"]);
var reservedJoins15 = expandPhrases([
  "JOIN",
  "{LEFT | RIGHT | FULL} [OUTER] JOIN",
  "{INNER | CROSS} JOIN",
  "NATURAL {LEFT | RIGHT} [OUTER] JOIN",
  // non-standard joins
  "STRAIGHT_JOIN"
]);
var reservedPhrases15 = expandPhrases(["ON DELETE", "ON UPDATE", "CHARACTER SET", "{ROWS | RANGE} BETWEEN"]);
var singlestoredb = {
  tokenizerOptions: {
    reservedSelect: reservedSelect15,
    reservedClauses: [...reservedClauses15, ...onelineClauses15],
    reservedSetOperations: reservedSetOperations15,
    reservedJoins: reservedJoins15,
    reservedPhrases: reservedPhrases15,
    reservedKeywords: keywords15,
    reservedFunctionNames: functions15,
    // TODO: support _binary"some string" prefix
    stringTypes: ['""-qq-bs', "''-qq-bs", {
      quote: "''-raw",
      prefixes: ["B", "X"],
      requirePrefix: true
    }],
    identTypes: ["``"],
    identChars: {
      first: "$",
      rest: "$",
      allowFirstCharNumber: true
    },
    variableTypes: [{
      regex: "@@?[A-Za-z0-9_$]+"
    }, {
      quote: "``",
      prefixes: ["@"],
      requirePrefix: true
    }],
    lineCommentTypes: ["--", "#"],
    operators: [":=", "&", "|", "^", "~", "<<", ">>", "<=>", "&&", "||", "::", "::$", "::%", ":>", "!:>"],
    postProcess: postProcess6
  },
  formatOptions: {
    alwaysDenseOperators: ["::", "::$", "::%"],
    onelineClauses: onelineClauses15
  }
};
function postProcess6(tokens) {
  return tokens.map((token, i) => {
    const nextToken = tokens[i + 1] || EOF_TOKEN;
    if (isToken.SET(token) && nextToken.text === "(") {
      return {
        ...token,
        type: TokenType.RESERVED_FUNCTION_NAME
      };
    }
    return token;
  });
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/snowflake/snowflake.functions.js
var functions16 = flatKeywordList({
  // https://docs.snowflake.com/en/sql-reference-functions.html
  //
  // https://docs.snowflake.com/en/sql-reference/functions-all.html
  // 1. run in console on this page: $x('//tbody/tr/*[1]//a/span/text()').map(x => x.nodeValue)
  // 2. split all lines that contain ',' or '/' into multiple lines
  // 3. remove all '— Deprecated' parts from the strings
  // 4. delete all strings that end with '<object_type>', they are already covered in the list
  // 5. remove all strings that contain '[', they are operators not functions
  // 6. fix all values that contain '*'
  // 7. delete operatos ':', '::', '||'
  //
  // Steps 1-5 can be combined by the following script in the developer console:
  // $x('//tbody/tr/*[1]//a/span/text()').map(x => x.nodeValue) // Step 1
  //   .map(x => x.split(x.includes(',') ? ',' : '/')).flat().map(x => x.trim()) // Step 2
  //   .map(x => x.replace('— Deprecated', '')) // Step 3
  //   .filter(x => !x.endsWith('<object_type>')) // Step 4
  //   .filter(x => !x.includes('[')) // Step 5
  all: ["ABS", "ACOS", "ACOSH", "ADD_MONTHS", "ALL_USER_NAMES", "ANY_VALUE", "APPROX_COUNT_DISTINCT", "APPROX_PERCENTILE", "APPROX_PERCENTILE_ACCUMULATE", "APPROX_PERCENTILE_COMBINE", "APPROX_PERCENTILE_ESTIMATE", "APPROX_TOP_K", "APPROX_TOP_K_ACCUMULATE", "APPROX_TOP_K_COMBINE", "APPROX_TOP_K_ESTIMATE", "APPROXIMATE_JACCARD_INDEX", "APPROXIMATE_SIMILARITY", "ARRAY_AGG", "ARRAY_APPEND", "ARRAY_CAT", "ARRAY_COMPACT", "ARRAY_CONSTRUCT", "ARRAY_CONSTRUCT_COMPACT", "ARRAY_CONTAINS", "ARRAY_INSERT", "ARRAY_INTERSECTION", "ARRAY_POSITION", "ARRAY_PREPEND", "ARRAY_SIZE", "ARRAY_SLICE", "ARRAY_TO_STRING", "ARRAY_UNION_AGG", "ARRAY_UNIQUE_AGG", "ARRAYS_OVERLAP", "AS_ARRAY", "AS_BINARY", "AS_BOOLEAN", "AS_CHAR", "AS_VARCHAR", "AS_DATE", "AS_DECIMAL", "AS_NUMBER", "AS_DOUBLE", "AS_REAL", "AS_INTEGER", "AS_OBJECT", "AS_TIME", "AS_TIMESTAMP_LTZ", "AS_TIMESTAMP_NTZ", "AS_TIMESTAMP_TZ", "ASCII", "ASIN", "ASINH", "ATAN", "ATAN2", "ATANH", "AUTO_REFRESH_REGISTRATION_HISTORY", "AUTOMATIC_CLUSTERING_HISTORY", "AVG", "BASE64_DECODE_BINARY", "BASE64_DECODE_STRING", "BASE64_ENCODE", "BIT_LENGTH", "BITAND", "BITAND_AGG", "BITMAP_BIT_POSITION", "BITMAP_BUCKET_NUMBER", "BITMAP_CONSTRUCT_AGG", "BITMAP_COUNT", "BITMAP_OR_AGG", "BITNOT", "BITOR", "BITOR_AGG", "BITSHIFTLEFT", "BITSHIFTRIGHT", "BITXOR", "BITXOR_AGG", "BOOLAND", "BOOLAND_AGG", "BOOLNOT", "BOOLOR", "BOOLOR_AGG", "BOOLXOR", "BOOLXOR_AGG", "BUILD_SCOPED_FILE_URL", "BUILD_STAGE_FILE_URL", "CASE", "CAST", "CBRT", "CEIL", "CHARINDEX", "CHECK_JSON", "CHECK_XML", "CHR", "CHAR", "COALESCE", "COLLATE", "COLLATION", "COMPLETE_TASK_GRAPHS", "COMPRESS", "CONCAT", "CONCAT_WS", "CONDITIONAL_CHANGE_EVENT", "CONDITIONAL_TRUE_EVENT", "CONTAINS", "CONVERT_TIMEZONE", "COPY_HISTORY", "CORR", "COS", "COSH", "COT", "COUNT", "COUNT_IF", "COVAR_POP", "COVAR_SAMP", "CUME_DIST", "CURRENT_ACCOUNT", "CURRENT_AVAILABLE_ROLES", "CURRENT_CLIENT", "CURRENT_DATABASE", "CURRENT_DATE", "CURRENT_IP_ADDRESS", "CURRENT_REGION", "CURRENT_ROLE", "CURRENT_SCHEMA", "CURRENT_SCHEMAS", "CURRENT_SECONDARY_ROLES", "CURRENT_SESSION", "CURRENT_STATEMENT", "CURRENT_TASK_GRAPHS", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_TRANSACTION", "CURRENT_USER", "CURRENT_VERSION", "CURRENT_WAREHOUSE", "DATA_TRANSFER_HISTORY", "DATABASE_REFRESH_HISTORY", "DATABASE_REFRESH_PROGRESS", "DATABASE_REFRESH_PROGRESS_BY_JOB", "DATABASE_STORAGE_USAGE_HISTORY", "DATE_FROM_PARTS", "DATE_PART", "DATE_TRUNC", "DATEADD", "DATEDIFF", "DAYNAME", "DECODE", "DECOMPRESS_BINARY", "DECOMPRESS_STRING", "DECRYPT", "DECRYPT_RAW", "DEGREES", "DENSE_RANK", "DIV0", "EDITDISTANCE", "ENCRYPT", "ENCRYPT_RAW", "ENDSWITH", "EQUAL_NULL", "EXP", "EXPLAIN_JSON", "EXTERNAL_FUNCTIONS_HISTORY", "EXTERNAL_TABLE_FILES", "EXTERNAL_TABLE_FILE_REGISTRATION_HISTORY", "EXTRACT", "EXTRACT_SEMANTIC_CATEGORIES", "FACTORIAL", "FIRST_VALUE", "FLATTEN", "FLOOR", "GENERATE_COLUMN_DESCRIPTION", "GENERATOR", "GET", "GET_ABSOLUTE_PATH", "GET_DDL", "GET_IGNORE_CASE", "GET_OBJECT_REFERENCES", "GET_PATH", "GET_PRESIGNED_URL", "GET_RELATIVE_PATH", "GET_STAGE_LOCATION", "GETBIT", "GREATEST", "GROUPING", "GROUPING_ID", "HASH", "HASH_AGG", "HAVERSINE", "HEX_DECODE_BINARY", "HEX_DECODE_STRING", "HEX_ENCODE", "HLL", "HLL_ACCUMULATE", "HLL_COMBINE", "HLL_ESTIMATE", "HLL_EXPORT", "HLL_IMPORT", "HOUR", "MINUTE", "SECOND", "IFF", "IFNULL", "ILIKE", "ILIKE ANY", "INFER_SCHEMA", "INITCAP", "INSERT", "INVOKER_ROLE", "INVOKER_SHARE", "IS_ARRAY", "IS_BINARY", "IS_BOOLEAN", "IS_CHAR", "IS_VARCHAR", "IS_DATE", "IS_DATE_VALUE", "IS_DECIMAL", "IS_DOUBLE", "IS_REAL", "IS_GRANTED_TO_INVOKER_ROLE", "IS_INTEGER", "IS_NULL_VALUE", "IS_OBJECT", "IS_ROLE_IN_SESSION", "IS_TIME", "IS_TIMESTAMP_LTZ", "IS_TIMESTAMP_NTZ", "IS_TIMESTAMP_TZ", "JAROWINKLER_SIMILARITY", "JSON_EXTRACT_PATH_TEXT", "KURTOSIS", "LAG", "LAST_DAY", "LAST_QUERY_ID", "LAST_TRANSACTION", "LAST_VALUE", "LEAD", "LEAST", "LEFT", "LENGTH", "LEN", "LIKE", "LIKE ALL", "LIKE ANY", "LISTAGG", "LN", "LOCALTIME", "LOCALTIMESTAMP", "LOG", "LOGIN_HISTORY", "LOGIN_HISTORY_BY_USER", "LOWER", "LPAD", "LTRIM", "MATERIALIZED_VIEW_REFRESH_HISTORY", "MD5", "MD5_HEX", "MD5_BINARY", "MD5_NUMBER \u2014 Obsoleted", "MD5_NUMBER_LOWER64", "MD5_NUMBER_UPPER64", "MEDIAN", "MIN", "MAX", "MINHASH", "MINHASH_COMBINE", "MOD", "MODE", "MONTHNAME", "MONTHS_BETWEEN", "NEXT_DAY", "NORMAL", "NTH_VALUE", "NTILE", "NULLIF", "NULLIFZERO", "NVL", "NVL2", "OBJECT_AGG", "OBJECT_CONSTRUCT", "OBJECT_CONSTRUCT_KEEP_NULL", "OBJECT_DELETE", "OBJECT_INSERT", "OBJECT_KEYS", "OBJECT_PICK", "OCTET_LENGTH", "PARSE_IP", "PARSE_JSON", "PARSE_URL", "PARSE_XML", "PERCENT_RANK", "PERCENTILE_CONT", "PERCENTILE_DISC", "PI", "PIPE_USAGE_HISTORY", "POLICY_CONTEXT", "POLICY_REFERENCES", "POSITION", "POW", "POWER", "PREVIOUS_DAY", "QUERY_ACCELERATION_HISTORY", "QUERY_HISTORY", "QUERY_HISTORY_BY_SESSION", "QUERY_HISTORY_BY_USER", "QUERY_HISTORY_BY_WAREHOUSE", "RADIANS", "RANDOM", "RANDSTR", "RANK", "RATIO_TO_REPORT", "REGEXP", "REGEXP_COUNT", "REGEXP_INSTR", "REGEXP_LIKE", "REGEXP_REPLACE", "REGEXP_SUBSTR", "REGEXP_SUBSTR_ALL", "REGR_AVGX", "REGR_AVGY", "REGR_COUNT", "REGR_INTERCEPT", "REGR_R2", "REGR_SLOPE", "REGR_SXX", "REGR_SXY", "REGR_SYY", "REGR_VALX", "REGR_VALY", "REPEAT", "REPLACE", "REPLICATION_GROUP_REFRESH_HISTORY", "REPLICATION_GROUP_REFRESH_PROGRESS", "REPLICATION_GROUP_REFRESH_PROGRESS_BY_JOB", "REPLICATION_GROUP_USAGE_HISTORY", "REPLICATION_USAGE_HISTORY", "REST_EVENT_HISTORY", "RESULT_SCAN", "REVERSE", "RIGHT", "RLIKE", "ROUND", "ROW_NUMBER", "RPAD", "RTRIM", "RTRIMMED_LENGTH", "SEARCH_OPTIMIZATION_HISTORY", "SEQ1", "SEQ2", "SEQ4", "SEQ8", "SERVERLESS_TASK_HISTORY", "SHA1", "SHA1_HEX", "SHA1_BINARY", "SHA2", "SHA2_HEX", "SHA2_BINARY", "SIGN", "SIN", "SINH", "SKEW", "SOUNDEX", "SPACE", "SPLIT", "SPLIT_PART", "SPLIT_TO_TABLE", "SQRT", "SQUARE", "ST_AREA", "ST_ASEWKB", "ST_ASEWKT", "ST_ASGEOJSON", "ST_ASWKB", "ST_ASBINARY", "ST_ASWKT", "ST_ASTEXT", "ST_AZIMUTH", "ST_CENTROID", "ST_COLLECT", "ST_CONTAINS", "ST_COVEREDBY", "ST_COVERS", "ST_DIFFERENCE", "ST_DIMENSION", "ST_DISJOINT", "ST_DISTANCE", "ST_DWITHIN", "ST_ENDPOINT", "ST_ENVELOPE", "ST_GEOGFROMGEOHASH", "ST_GEOGPOINTFROMGEOHASH", "ST_GEOGRAPHYFROMWKB", "ST_GEOGRAPHYFROMWKT", "ST_GEOHASH", "ST_GEOMETRYFROMWKB", "ST_GEOMETRYFROMWKT", "ST_HAUSDORFFDISTANCE", "ST_INTERSECTION", "ST_INTERSECTS", "ST_LENGTH", "ST_MAKEGEOMPOINT", "ST_GEOM_POINT", "ST_MAKELINE", "ST_MAKEPOINT", "ST_POINT", "ST_MAKEPOLYGON", "ST_POLYGON", "ST_NPOINTS", "ST_NUMPOINTS", "ST_PERIMETER", "ST_POINTN", "ST_SETSRID", "ST_SIMPLIFY", "ST_SRID", "ST_STARTPOINT", "ST_SYMDIFFERENCE", "ST_UNION", "ST_WITHIN", "ST_X", "ST_XMAX", "ST_XMIN", "ST_Y", "ST_YMAX", "ST_YMIN", "STAGE_DIRECTORY_FILE_REGISTRATION_HISTORY", "STAGE_STORAGE_USAGE_HISTORY", "STARTSWITH", "STDDEV", "STDDEV_POP", "STDDEV_SAMP", "STRIP_NULL_VALUE", "STRTOK", "STRTOK_SPLIT_TO_TABLE", "STRTOK_TO_ARRAY", "SUBSTR", "SUBSTRING", "SUM", "SYSDATE", "SYSTEM$ABORT_SESSION", "SYSTEM$ABORT_TRANSACTION", "SYSTEM$AUTHORIZE_PRIVATELINK", "SYSTEM$AUTHORIZE_STAGE_PRIVATELINK_ACCESS", "SYSTEM$BEHAVIOR_CHANGE_BUNDLE_STATUS", "SYSTEM$CANCEL_ALL_QUERIES", "SYSTEM$CANCEL_QUERY", "SYSTEM$CLUSTERING_DEPTH", "SYSTEM$CLUSTERING_INFORMATION", "SYSTEM$CLUSTERING_RATIO ", "SYSTEM$CURRENT_USER_TASK_NAME", "SYSTEM$DATABASE_REFRESH_HISTORY ", "SYSTEM$DATABASE_REFRESH_PROGRESS", "SYSTEM$DATABASE_REFRESH_PROGRESS_BY_JOB ", "SYSTEM$DISABLE_BEHAVIOR_CHANGE_BUNDLE", "SYSTEM$DISABLE_DATABASE_REPLICATION", "SYSTEM$ENABLE_BEHAVIOR_CHANGE_BUNDLE", "SYSTEM$ESTIMATE_QUERY_ACCELERATION", "SYSTEM$ESTIMATE_SEARCH_OPTIMIZATION_COSTS", "SYSTEM$EXPLAIN_JSON_TO_TEXT", "SYSTEM$EXPLAIN_PLAN_JSON", "SYSTEM$EXTERNAL_TABLE_PIPE_STATUS", "SYSTEM$GENERATE_SAML_CSR", "SYSTEM$GENERATE_SCIM_ACCESS_TOKEN", "SYSTEM$GET_AWS_SNS_IAM_POLICY", "SYSTEM$GET_PREDECESSOR_RETURN_VALUE", "SYSTEM$GET_PRIVATELINK", "SYSTEM$GET_PRIVATELINK_AUTHORIZED_ENDPOINTS", "SYSTEM$GET_PRIVATELINK_CONFIG", "SYSTEM$GET_SNOWFLAKE_PLATFORM_INFO", "SYSTEM$GET_TAG", "SYSTEM$GET_TAG_ALLOWED_VALUES", "SYSTEM$GET_TAG_ON_CURRENT_COLUMN", "SYSTEM$GET_TAG_ON_CURRENT_TABLE", "SYSTEM$GLOBAL_ACCOUNT_SET_PARAMETER", "SYSTEM$LAST_CHANGE_COMMIT_TIME", "SYSTEM$LINK_ACCOUNT_OBJECTS_BY_NAME", "SYSTEM$MIGRATE_SAML_IDP_REGISTRATION", "SYSTEM$PIPE_FORCE_RESUME", "SYSTEM$PIPE_STATUS", "SYSTEM$REVOKE_PRIVATELINK", "SYSTEM$REVOKE_STAGE_PRIVATELINK_ACCESS", "SYSTEM$SET_RETURN_VALUE", "SYSTEM$SHOW_OAUTH_CLIENT_SECRETS", "SYSTEM$STREAM_GET_TABLE_TIMESTAMP", "SYSTEM$STREAM_HAS_DATA", "SYSTEM$TASK_DEPENDENTS_ENABLE", "SYSTEM$TYPEOF", "SYSTEM$USER_TASK_CANCEL_ONGOING_EXECUTIONS", "SYSTEM$VERIFY_EXTERNAL_OAUTH_TOKEN", "SYSTEM$WAIT", "SYSTEM$WHITELIST", "SYSTEM$WHITELIST_PRIVATELINK", "TAG_REFERENCES", "TAG_REFERENCES_ALL_COLUMNS", "TAG_REFERENCES_WITH_LINEAGE", "TAN", "TANH", "TASK_DEPENDENTS", "TASK_HISTORY", "TIME_FROM_PARTS", "TIME_SLICE", "TIMEADD", "TIMEDIFF", "TIMESTAMP_FROM_PARTS", "TIMESTAMPADD", "TIMESTAMPDIFF", "TO_ARRAY", "TO_BINARY", "TO_BOOLEAN", "TO_CHAR", "TO_VARCHAR", "TO_DATE", "DATE", "TO_DECIMAL", "TO_NUMBER", "TO_NUMERIC", "TO_DOUBLE", "TO_GEOGRAPHY", "TO_GEOMETRY", "TO_JSON", "TO_OBJECT", "TO_TIME", "TIME", "TO_TIMESTAMP", "TO_TIMESTAMP_LTZ", "TO_TIMESTAMP_NTZ", "TO_TIMESTAMP_TZ", "TO_VARIANT", "TO_XML", "TRANSLATE", "TRIM", "TRUNCATE", "TRUNC", "TRUNC", "TRY_BASE64_DECODE_BINARY", "TRY_BASE64_DECODE_STRING", "TRY_CAST", "TRY_HEX_DECODE_BINARY", "TRY_HEX_DECODE_STRING", "TRY_PARSE_JSON", "TRY_TO_BINARY", "TRY_TO_BOOLEAN", "TRY_TO_DATE", "TRY_TO_DECIMAL", "TRY_TO_NUMBER", "TRY_TO_NUMERIC", "TRY_TO_DOUBLE", "TRY_TO_GEOGRAPHY", "TRY_TO_GEOMETRY", "TRY_TO_TIME", "TRY_TO_TIMESTAMP", "TRY_TO_TIMESTAMP_LTZ", "TRY_TO_TIMESTAMP_NTZ", "TRY_TO_TIMESTAMP_TZ", "TYPEOF", "UNICODE", "UNIFORM", "UPPER", "UUID_STRING", "VALIDATE", "VALIDATE_PIPE_LOAD", "VAR_POP", "VAR_SAMP", "VARIANCE", "VARIANCE_SAMP", "VARIANCE_POP", "WAREHOUSE_LOAD_HISTORY", "WAREHOUSE_METERING_HISTORY", "WIDTH_BUCKET", "XMLGET", "YEAR", "YEAROFWEEK", "YEAROFWEEKISO", "DAY", "DAYOFMONTH", "DAYOFWEEK", "DAYOFWEEKISO", "DAYOFYEAR", "WEEK", "WEEK", "WEEKOFYEAR", "WEEKISO", "MONTH", "QUARTER", "ZEROIFNULL", "ZIPF"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/snowflake/snowflake.keywords.js
var keywords16 = flatKeywordList({
  // https://docs.snowflake.com/en/sql-reference/reserved-keywords.html
  //
  // run in console on this page: $x('//tbody/tr/*[1]/p/text()').map(x => x.nodeValue)
  all: ["ACCOUNT", "ALL", "ALTER", "AND", "ANY", "AS", "BETWEEN", "BY", "CASE", "CAST", "CHECK", "COLUMN", "CONNECT", "CONNECTION", "CONSTRAINT", "CREATE", "CROSS", "CURRENT", "CURRENT_DATE", "CURRENT_TIME", "CURRENT_TIMESTAMP", "CURRENT_USER", "DATABASE", "DELETE", "DISTINCT", "DROP", "ELSE", "EXISTS", "FALSE", "FOLLOWING", "FOR", "FROM", "FULL", "GRANT", "GROUP", "GSCLUSTER", "HAVING", "ILIKE", "IN", "INCREMENT", "INNER", "INSERT", "INTERSECT", "INTO", "IS", "ISSUE", "JOIN", "LATERAL", "LEFT", "LIKE", "LOCALTIME", "LOCALTIMESTAMP", "MINUS", "NATURAL", "NOT", "NULL", "OF", "ON", "OR", "ORDER", "ORGANIZATION", "QUALIFY", "REGEXP", "REVOKE", "RIGHT", "RLIKE", "ROW", "ROWS", "SAMPLE", "SCHEMA", "SELECT", "SET", "SOME", "START", "TABLE", "TABLESAMPLE", "THEN", "TO", "TRIGGER", "TRUE", "TRY_CAST", "UNION", "UNIQUE", "UPDATE", "USING", "VALUES", "VIEW", "WHEN", "WHENEVER", "WHERE", "WITH"]
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/languages/snowflake/snowflake.formatter.js
var reservedSelect16 = expandPhrases(["SELECT [ALL | DISTINCT]"]);
var reservedClauses16 = expandPhrases([
  // queries
  "WITH [RECURSIVE]",
  "FROM",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "PARTITION BY",
  "ORDER BY",
  "QUALIFY",
  "LIMIT",
  "OFFSET",
  "FETCH [FIRST | NEXT]",
  // Data manipulation
  // - insert:
  "INSERT [OVERWRITE] [ALL INTO | INTO | ALL | FIRST]",
  "{THEN | ELSE} INTO",
  "VALUES",
  // - update:
  "SET",
  // Data definition
  // - view
  "CREATE [OR REPLACE] [SECURE] [RECURSIVE] VIEW [IF NOT EXISTS]",
  // - create/drop/merge table
  "CREATE [OR REPLACE] [VOLATILE] TABLE [IF NOT EXISTS]",
  "CREATE [OR REPLACE] [LOCAL | GLOBAL] {TEMP|TEMPORARY} TABLE [IF NOT EXISTS]",
  "CLUSTER BY",
  "[WITH] {MASKING POLICY | TAG | ROW ACCESS POLICY}",
  "COPY GRANTS",
  "USING TEMPLATE",
  "MERGE INTO",
  "WHEN MATCHED [AND]",
  "THEN {UPDATE SET | DELETE}",
  "WHEN NOT MATCHED THEN INSERT"
]);
var onelineClauses16 = expandPhrases([
  // - update:
  "UPDATE",
  // - delete:
  "DELETE FROM",
  // - drop table:
  "DROP TABLE [IF EXISTS]",
  // - alter table:
  "ALTER TABLE [IF EXISTS]",
  "RENAME TO",
  "SWAP WITH",
  "[SUSPEND | RESUME] RECLUSTER",
  "DROP CLUSTERING KEY",
  "ADD [COLUMN]",
  "RENAME COLUMN",
  "{ALTER | MODIFY} [COLUMN]",
  "DROP [COLUMN]",
  "{ADD | ALTER | MODIFY | DROP} [CONSTRAINT]",
  "RENAME CONSTRAINT",
  "{ADD | DROP} SEARCH OPTIMIZATION",
  "{SET | UNSET} TAG",
  // Actually TAG is optional, but that conflicts with UPDATE..SET statement
  "{ADD | DROP} ROW ACCESS POLICY",
  "DROP ALL ROW ACCESS POLICIES",
  "{SET | DROP} DEFAULT",
  // for alter column
  "{SET | DROP} NOT NULL",
  // for alter column
  "[SET DATA] TYPE",
  // for alter column
  "[UNSET] COMMENT",
  // for alter column
  "{SET | UNSET} MASKING POLICY",
  // for alter column
  // - truncate:
  "TRUNCATE [TABLE] [IF EXISTS]",
  // other
  // https://docs.snowflake.com/en/sql-reference/sql-all.html
  //
  // 1. run in console on this page: $x('//tbody/tr/*[1]//a/span/text()').map(x => x.nodeValue)
  // 2. delete all lines that contain a sting like '(.*)', they are already covered in the list
  // 3. delete all lines that contain a sting like '<.*>', they are already covered in the list
  // 4. delete all lines that contain '…', they are part of a regex statement that can't be covered here
  // 5. Manually add 'COPY INTO'
  // 6. Remove all lines that are already in `reservedClauses`
  //
  // Steps 1-4 can be combined by the following script in the developer console:
  // $x('//tbody/tr/*[1]//a/span/text()').map(x => x.nodeValue) // Step 1
  //   filter(x => !x.match(/\(.*\)/) && !x.match(/…/) && !x.match(/<.*>/)) // Step 2-4
  "ALTER ACCOUNT",
  "ALTER API INTEGRATION",
  "ALTER CONNECTION",
  "ALTER DATABASE",
  "ALTER EXTERNAL TABLE",
  "ALTER FAILOVER GROUP",
  "ALTER FILE FORMAT",
  "ALTER FUNCTION",
  "ALTER INTEGRATION",
  "ALTER MASKING POLICY",
  "ALTER MATERIALIZED VIEW",
  "ALTER NETWORK POLICY",
  "ALTER NOTIFICATION INTEGRATION",
  "ALTER PIPE",
  "ALTER PROCEDURE",
  "ALTER REPLICATION GROUP",
  "ALTER RESOURCE MONITOR",
  "ALTER ROLE",
  "ALTER ROW ACCESS POLICY",
  "ALTER SCHEMA",
  "ALTER SECURITY INTEGRATION",
  "ALTER SEQUENCE",
  "ALTER SESSION",
  "ALTER SESSION POLICY",
  "ALTER SHARE",
  "ALTER STAGE",
  "ALTER STORAGE INTEGRATION",
  "ALTER STREAM",
  "ALTER TAG",
  "ALTER TASK",
  "ALTER USER",
  "ALTER VIEW",
  "ALTER WAREHOUSE",
  "BEGIN",
  "CALL",
  "COMMIT",
  "COPY INTO",
  "CREATE ACCOUNT",
  "CREATE API INTEGRATION",
  "CREATE CONNECTION",
  "CREATE DATABASE",
  "CREATE EXTERNAL FUNCTION",
  "CREATE EXTERNAL TABLE",
  "CREATE FAILOVER GROUP",
  "CREATE FILE FORMAT",
  "CREATE FUNCTION",
  "CREATE INTEGRATION",
  "CREATE MANAGED ACCOUNT",
  "CREATE MASKING POLICY",
  "CREATE MATERIALIZED VIEW",
  "CREATE NETWORK POLICY",
  "CREATE NOTIFICATION INTEGRATION",
  "CREATE PIPE",
  "CREATE PROCEDURE",
  "CREATE REPLICATION GROUP",
  "CREATE RESOURCE MONITOR",
  "CREATE ROLE",
  "CREATE ROW ACCESS POLICY",
  "CREATE SCHEMA",
  "CREATE SECURITY INTEGRATION",
  "CREATE SEQUENCE",
  "CREATE SESSION POLICY",
  "CREATE SHARE",
  "CREATE STAGE",
  "CREATE STORAGE INTEGRATION",
  "CREATE STREAM",
  "CREATE TAG",
  "CREATE TASK",
  "CREATE USER",
  "CREATE WAREHOUSE",
  "DELETE",
  "DESCRIBE DATABASE",
  "DESCRIBE EXTERNAL TABLE",
  "DESCRIBE FILE FORMAT",
  "DESCRIBE FUNCTION",
  "DESCRIBE INTEGRATION",
  "DESCRIBE MASKING POLICY",
  "DESCRIBE MATERIALIZED VIEW",
  "DESCRIBE NETWORK POLICY",
  "DESCRIBE PIPE",
  "DESCRIBE PROCEDURE",
  "DESCRIBE RESULT",
  "DESCRIBE ROW ACCESS POLICY",
  "DESCRIBE SCHEMA",
  "DESCRIBE SEQUENCE",
  "DESCRIBE SESSION POLICY",
  "DESCRIBE SHARE",
  "DESCRIBE STAGE",
  "DESCRIBE STREAM",
  "DESCRIBE TABLE",
  "DESCRIBE TASK",
  "DESCRIBE TRANSACTION",
  "DESCRIBE USER",
  "DESCRIBE VIEW",
  "DESCRIBE WAREHOUSE",
  "DROP CONNECTION",
  "DROP DATABASE",
  "DROP EXTERNAL TABLE",
  "DROP FAILOVER GROUP",
  "DROP FILE FORMAT",
  "DROP FUNCTION",
  "DROP INTEGRATION",
  "DROP MANAGED ACCOUNT",
  "DROP MASKING POLICY",
  "DROP MATERIALIZED VIEW",
  "DROP NETWORK POLICY",
  "DROP PIPE",
  "DROP PROCEDURE",
  "DROP REPLICATION GROUP",
  "DROP RESOURCE MONITOR",
  "DROP ROLE",
  "DROP ROW ACCESS POLICY",
  "DROP SCHEMA",
  "DROP SEQUENCE",
  "DROP SESSION POLICY",
  "DROP SHARE",
  "DROP STAGE",
  "DROP STREAM",
  "DROP TAG",
  "DROP TASK",
  "DROP USER",
  "DROP VIEW",
  "DROP WAREHOUSE",
  "EXECUTE IMMEDIATE",
  "EXECUTE TASK",
  "EXPLAIN",
  "GET",
  "GRANT OWNERSHIP",
  "GRANT ROLE",
  "INSERT",
  "LIST",
  "MERGE",
  "PUT",
  "REMOVE",
  "REVOKE ROLE",
  "ROLLBACK",
  "SHOW COLUMNS",
  "SHOW CONNECTIONS",
  "SHOW DATABASES",
  "SHOW DATABASES IN FAILOVER GROUP",
  "SHOW DATABASES IN REPLICATION GROUP",
  "SHOW DELEGATED AUTHORIZATIONS",
  "SHOW EXTERNAL FUNCTIONS",
  "SHOW EXTERNAL TABLES",
  "SHOW FAILOVER GROUPS",
  "SHOW FILE FORMATS",
  "SHOW FUNCTIONS",
  "SHOW GLOBAL ACCOUNTS",
  "SHOW GRANTS",
  "SHOW INTEGRATIONS",
  "SHOW LOCKS",
  "SHOW MANAGED ACCOUNTS",
  "SHOW MASKING POLICIES",
  "SHOW MATERIALIZED VIEWS",
  "SHOW NETWORK POLICIES",
  "SHOW OBJECTS",
  "SHOW ORGANIZATION ACCOUNTS",
  "SHOW PARAMETERS",
  "SHOW PIPES",
  "SHOW PRIMARY KEYS",
  "SHOW PROCEDURES",
  "SHOW REGIONS",
  "SHOW REPLICATION ACCOUNTS",
  "SHOW REPLICATION DATABASES",
  "SHOW REPLICATION GROUPS",
  "SHOW RESOURCE MONITORS",
  "SHOW ROLES",
  "SHOW ROW ACCESS POLICIES",
  "SHOW SCHEMAS",
  "SHOW SEQUENCES",
  "SHOW SESSION POLICIES",
  "SHOW SHARES",
  "SHOW SHARES IN FAILOVER GROUP",
  "SHOW SHARES IN REPLICATION GROUP",
  "SHOW STAGES",
  "SHOW STREAMS",
  "SHOW TABLES",
  "SHOW TAGS",
  "SHOW TASKS",
  "SHOW TRANSACTIONS",
  "SHOW USER FUNCTIONS",
  "SHOW USERS",
  "SHOW VARIABLES",
  "SHOW VIEWS",
  "SHOW WAREHOUSES",
  "TRUNCATE MATERIALIZED VIEW",
  "UNDROP DATABASE",
  "UNDROP SCHEMA",
  "UNDROP TABLE",
  "UNDROP TAG",
  "UNSET",
  "USE DATABASE",
  "USE ROLE",
  "USE SCHEMA",
  "USE SECONDARY ROLES",
  "USE WAREHOUSE"
]);
var reservedSetOperations16 = expandPhrases(["UNION [ALL]", "MINUS", "EXCEPT", "INTERSECT"]);
var reservedJoins16 = expandPhrases(["[INNER] JOIN", "[NATURAL] {LEFT | RIGHT | FULL} [OUTER] JOIN", "{CROSS | NATURAL} JOIN"]);
var reservedPhrases16 = expandPhrases(["{ROWS | RANGE} BETWEEN", "ON {UPDATE | DELETE} [SET NULL | SET DEFAULT]"]);
var snowflake = {
  tokenizerOptions: {
    reservedSelect: reservedSelect16,
    reservedClauses: [...reservedClauses16, ...onelineClauses16],
    reservedSetOperations: reservedSetOperations16,
    reservedJoins: reservedJoins16,
    reservedPhrases: reservedPhrases16,
    reservedKeywords: keywords16,
    reservedFunctionNames: functions16,
    stringTypes: ["$$", `''-qq-bs`],
    identTypes: ['""-qq'],
    variableTypes: [
      // for accessing columns at certain positons in the table
      {
        regex: "[$][1-9]\\d*"
      },
      // identifier style syntax
      {
        regex: "[$][_a-zA-Z][_a-zA-Z0-9$]*"
      }
    ],
    extraParens: ["[]"],
    identChars: {
      rest: "$"
    },
    lineCommentTypes: ["--", "//"],
    operators: [
      // Modulo
      "%",
      // Type cast
      "::",
      // String concat
      "||",
      // Get Path
      ":",
      // Generators: https://docs.snowflake.com/en/sql-reference/functions/generator.html#generator
      "=>"
    ]
  },
  formatOptions: {
    alwaysDenseOperators: [":", "::"],
    onelineClauses: onelineClauses16
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/lexer/regexUtil.js
var escapeRegExp = (string2) => string2.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
var WHITESPACE_REGEX = /\s+/uy;
var patternToRegex = (pattern) => new RegExp(`(?:${pattern})`, "uy");
var toCaseInsensitivePattern = (prefix) => prefix.split("").map((char) => / /gu.test(char) ? "\\s+" : `[${char.toUpperCase()}${char.toLowerCase()}]`).join("");
var withDashes = (pattern) => pattern + "(?:-" + pattern + ")*";
var prefixesPattern = ({
  prefixes,
  requirePrefix
}) => `(?:${prefixes.map(toCaseInsensitivePattern).join("|")}${requirePrefix ? "" : "|"})`;

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/lexer/regexFactory.js
var lineComment = (lineCommentTypes) => new RegExp(`(?:${lineCommentTypes.map(escapeRegExp).join("|")}).*?(?=\r
|\r|
|$)`, "uy");
var parenthesis = (kind, extraParens = []) => {
  const index = kind === "open" ? 0 : 1;
  const parens = ["()", ...extraParens].map((pair) => pair[index]);
  return patternToRegex(parens.map(escapeRegExp).join("|"));
};
var operator = (operators) => patternToRegex(`${sortByLengthDesc(operators).map(escapeRegExp).join("|")}`);
var rejectIdentCharsPattern = ({
  rest,
  dashes
}) => rest || dashes ? `(?![${rest || ""}${dashes ? "-" : ""}])` : "";
var reservedWord = (reservedKeywords, identChars = {}) => {
  if (reservedKeywords.length === 0) {
    return /^\b$/u;
  }
  const avoidIdentChars = rejectIdentCharsPattern(identChars);
  const reservedKeywordsPattern = sortByLengthDesc(reservedKeywords).map(escapeRegExp).join("|").replace(/ /gu, "\\s+");
  return new RegExp(`(?:${reservedKeywordsPattern})${avoidIdentChars}\\b`, "iuy");
};
var parameter = (paramTypes, pattern) => {
  if (!paramTypes.length) {
    return void 0;
  }
  const typesRegex = paramTypes.map(escapeRegExp).join("|");
  return patternToRegex(`(?:${typesRegex})(?:${pattern})`);
};
var buildQStringPatterns = () => {
  const specialDelimiterMap = {
    "<": ">",
    "[": "]",
    "(": ")",
    "{": "}"
  };
  const singlePattern = "{left}(?:(?!{right}').)*?{right}";
  const patternList = Object.entries(specialDelimiterMap).map(([left, right]) => singlePattern.replace(/{left}/g, escapeRegExp(left)).replace(/{right}/g, escapeRegExp(right)));
  const specialDelimiters = escapeRegExp(Object.keys(specialDelimiterMap).join(""));
  const standardDelimiterPattern = String.raw`(?<tag>[^\s${specialDelimiters}])(?:(?!\k<tag>').)*?\k<tag>`;
  const qStringPattern = `[Qq]'(?:${standardDelimiterPattern}|${patternList.join("|")})'`;
  return qStringPattern;
};
var quotePatterns = {
  // - backtick quoted (using `` to escape)
  "``": "(?:`[^`]*`)+",
  // - Transact-SQL square bracket quoted (using ]] to escape)
  "[]": String.raw`(?:\[[^\]]*\])(?:\][^\]]*\])*`,
  // double-quoted
  '""-qq': String.raw`(?:"[^"]*")+`,
  // with repeated quote escapes
  '""-bs': String.raw`(?:"[^"\\]*(?:\\.[^"\\]*)*")`,
  // with backslash escapes
  '""-qq-bs': String.raw`(?:"[^"\\]*(?:\\.[^"\\]*)*")+`,
  // with repeated quote or backslash escapes
  '""-raw': String.raw`(?:"[^"]*")`,
  // no escaping
  // single-quoted
  "''-qq": String.raw`(?:'[^']*')+`,
  // with repeated quote escapes
  "''-bs": String.raw`(?:'[^'\\]*(?:\\.[^'\\]*)*')`,
  // with backslash escapes
  "''-qq-bs": String.raw`(?:'[^'\\]*(?:\\.[^'\\]*)*')+`,
  // with repeated quote or backslash escapes
  "''-raw": String.raw`(?:'[^']*')`,
  // no escaping
  // PostgreSQL dollar-quoted
  "$$": String.raw`(?<tag>\$\w*\$)[\s\S]*?\k<tag>`,
  // BigQuery '''triple-quoted''' (using \' to escape)
  "'''..'''": String.raw`'''[^\\]*?(?:\\.[^\\]*?)*?'''`,
  // BigQuery """triple-quoted""" (using \" to escape)
  '""".."""': String.raw`"""[^\\]*?(?:\\.[^\\]*?)*?"""`,
  // Hive and Spark variables: ${name}
  "{}": String.raw`(?:\{[^\}]*\})`,
  // Oracle q'' strings: q'<text>' q'|text|' ...
  "q''": buildQStringPatterns()
};
var singleQuotePattern = (quoteTypes) => {
  if (typeof quoteTypes === "string") {
    return quotePatterns[quoteTypes];
  } else if ("regex" in quoteTypes) {
    return quoteTypes.regex;
  } else {
    return prefixesPattern(quoteTypes) + quotePatterns[quoteTypes.quote];
  }
};
var variable = (varTypes) => patternToRegex(varTypes.map((varType) => "regex" in varType ? varType.regex : singleQuotePattern(varType)).join("|"));
var stringPattern = (quoteTypes) => quoteTypes.map(singleQuotePattern).join("|");
var string = (quoteTypes) => patternToRegex(stringPattern(quoteTypes));
var identifier = (specialChars = {}) => patternToRegex(identifierPattern(specialChars));
var identifierPattern = ({
  first,
  rest,
  dashes,
  allowFirstCharNumber
} = {}) => {
  const letter = "\\p{Alphabetic}\\p{Mark}_";
  const number = "\\p{Decimal_Number}";
  const firstChars = escapeRegExp(first ?? "");
  const restChars = escapeRegExp(rest ?? "");
  const pattern = allowFirstCharNumber ? `[${letter}${number}${firstChars}][${letter}${number}${restChars}]*` : `[${letter}${firstChars}][${letter}${number}${restChars}]*`;
  return dashes ? withDashes(pattern) : pattern;
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/lexer/lineColFromIndex.js
function lineColFromIndex(source, index) {
  const lines = source.slice(0, index).split(/\n/);
  return {
    line: lines.length,
    col: lines[lines.length - 1].length + 1
  };
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/lexer/TokenizerEngine.js
var TokenizerEngine = class {
  input = "";
  // The input SQL string to process
  index = 0;
  // Current position in string
  constructor(rules) {
    this.rules = rules;
  }
  /**
   * Takes a SQL string and breaks it into tokens.
   * Each token is an object with type and value.
   *
   * @param {string} input - The SQL string
   * @returns {Token[]} output token stream
   */
  tokenize(input) {
    this.input = input;
    this.index = 0;
    const tokens = [];
    let token;
    while (this.index < this.input.length) {
      const precedingWhitespace = this.getWhitespace();
      if (this.index < this.input.length) {
        token = this.getNextToken();
        if (!token) {
          throw this.createParseError();
        }
        tokens.push({
          ...token,
          precedingWhitespace
        });
      }
    }
    return tokens;
  }
  createParseError() {
    const text = this.input.slice(this.index, this.index + 10);
    const {
      line,
      col
    } = lineColFromIndex(this.input, this.index);
    return new Error(`Parse error: Unexpected "${text}" at line ${line} column ${col}`);
  }
  getWhitespace() {
    WHITESPACE_REGEX.lastIndex = this.index;
    const matches = WHITESPACE_REGEX.exec(this.input);
    if (matches) {
      this.index += matches[0].length;
      return matches[0];
    }
    return void 0;
  }
  getNextToken() {
    for (const rule of this.rules) {
      const token = this.match(rule);
      if (token) {
        return token;
      }
    }
    return void 0;
  }
  // Attempts to match token rule regex at current position in input
  match(rule) {
    rule.regex.lastIndex = this.index;
    const matches = rule.regex.exec(this.input);
    if (matches) {
      const matchedText = matches[0];
      const token = {
        type: rule.type,
        raw: matchedText,
        text: rule.text ? rule.text(matchedText) : matchedText,
        start: this.index
      };
      if (rule.key) {
        token.key = rule.key(matchedText);
      }
      this.index += matchedText.length;
      return token;
    }
    return void 0;
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/lexer/NestedComment.js
var START = /\/\*/uy;
var MIDDLE = /([^/*]|\*[^/]|\/[^*])+/uy;
var END2 = /\*\//uy;
var NestedComment = class {
  lastIndex = 0;
  exec(input) {
    let result = "";
    let match;
    let nestLevel = 0;
    if (match = this.matchSection(START, input)) {
      result += match;
      nestLevel++;
    } else {
      return null;
    }
    while (nestLevel > 0) {
      if (match = this.matchSection(START, input)) {
        result += match;
        nestLevel++;
      } else if (match = this.matchSection(END2, input)) {
        result += match;
        nestLevel--;
      } else if (match = this.matchSection(MIDDLE, input)) {
        result += match;
      } else {
        return null;
      }
    }
    return [result];
  }
  matchSection(regex, input) {
    regex.lastIndex = this.lastIndex;
    const matches = regex.exec(input);
    if (matches) {
      this.lastIndex += matches[0].length;
    }
    return matches ? matches[0] : null;
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/lexer/Tokenizer.js
var Tokenizer = class {
  constructor(cfg) {
    this.cfg = cfg;
    this.rulesBeforeParams = this.buildRulesBeforeParams(cfg);
    this.rulesAfterParams = this.buildRulesAfterParams(cfg);
  }
  tokenize(input, paramTypesOverrides) {
    const rules = [...this.rulesBeforeParams, ...this.buildParamRules(this.cfg, paramTypesOverrides), ...this.rulesAfterParams];
    const tokens = new TokenizerEngine(rules).tokenize(input);
    return this.cfg.postProcess ? this.cfg.postProcess(tokens) : tokens;
  }
  // These rules can be cached as they only depend on
  // the Tokenizer config options specified for each SQL dialect
  buildRulesBeforeParams(cfg) {
    return this.validRules([
      {
        type: TokenType.BLOCK_COMMENT,
        regex: cfg.nestedBlockComments ? new NestedComment() : /(\/\*[^]*?\*\/)/uy
      },
      {
        type: TokenType.LINE_COMMENT,
        regex: lineComment(cfg.lineCommentTypes ?? ["--"])
      },
      {
        type: TokenType.QUOTED_IDENTIFIER,
        regex: string(cfg.identTypes)
      },
      {
        type: TokenType.NUMBER,
        regex: /(?:0x[0-9a-fA-F]+|0b[01]+|(?:-\s*)?[0-9]+(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+(?:\.[0-9]+)?)?)(?!\w)/uy
      },
      // RESERVED_PHRASE is matched before all other keyword tokens
      // to e.g. prioritize matching "TIMESTAMP WITH TIME ZONE" phrase over "WITH" clause.
      {
        type: TokenType.RESERVED_PHRASE,
        regex: reservedWord(cfg.reservedPhrases ?? [], cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.CASE,
        regex: /CASE\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.END,
        regex: /END\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.BETWEEN,
        regex: /BETWEEN\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.LIMIT,
        regex: cfg.reservedClauses.includes("LIMIT") ? /LIMIT\b/iuy : void 0,
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_CLAUSE,
        regex: reservedWord(cfg.reservedClauses, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_SELECT,
        regex: reservedWord(cfg.reservedSelect, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_SET_OPERATION,
        regex: reservedWord(cfg.reservedSetOperations, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.WHEN,
        regex: /WHEN\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.ELSE,
        regex: /ELSE\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.THEN,
        regex: /THEN\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_JOIN,
        regex: reservedWord(cfg.reservedJoins, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.AND,
        regex: /AND\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.OR,
        regex: /OR\b/iuy,
        text: toCanonical
      },
      {
        type: TokenType.XOR,
        regex: cfg.supportsXor ? /XOR\b/iuy : void 0,
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_FUNCTION_NAME,
        regex: reservedWord(cfg.reservedFunctionNames, cfg.identChars),
        text: toCanonical
      },
      {
        type: TokenType.RESERVED_KEYWORD,
        regex: reservedWord(cfg.reservedKeywords, cfg.identChars),
        text: toCanonical
      }
    ]);
  }
  // These rules can also be cached as they only depend on
  // the Tokenizer config options specified for each SQL dialect
  buildRulesAfterParams(cfg) {
    return this.validRules([{
      type: TokenType.VARIABLE,
      regex: cfg.variableTypes ? variable(cfg.variableTypes) : void 0
    }, {
      type: TokenType.STRING,
      regex: string(cfg.stringTypes)
    }, {
      type: TokenType.IDENTIFIER,
      regex: identifier(cfg.identChars)
    }, {
      type: TokenType.DELIMITER,
      regex: /[;]/uy
    }, {
      type: TokenType.COMMA,
      regex: /[,]/y
    }, {
      type: TokenType.OPEN_PAREN,
      regex: parenthesis("open", cfg.extraParens)
    }, {
      type: TokenType.CLOSE_PAREN,
      regex: parenthesis("close", cfg.extraParens)
    }, {
      type: TokenType.OPERATOR,
      regex: operator([
        // standard operators
        "+",
        "-",
        "/",
        ">",
        "<",
        "=",
        "<>",
        "<=",
        ">=",
        "!=",
        ...cfg.operators ?? []
      ])
    }, {
      type: TokenType.ASTERISK,
      regex: /[*]/uy
    }, {
      type: TokenType.DOT,
      regex: /[.]/uy
    }]);
  }
  // These rules can't be blindly cached as the paramTypesOverrides object
  // can differ on each invocation of the format() function.
  buildParamRules(cfg, paramTypesOverrides) {
    var _cfg$paramTypes, _cfg$paramTypes2, _cfg$paramTypes3, _cfg$paramTypes4, _cfg$paramTypes5;
    const paramTypes = {
      named: (paramTypesOverrides === null || paramTypesOverrides === void 0 ? void 0 : paramTypesOverrides.named) || ((_cfg$paramTypes = cfg.paramTypes) === null || _cfg$paramTypes === void 0 ? void 0 : _cfg$paramTypes.named) || [],
      quoted: (paramTypesOverrides === null || paramTypesOverrides === void 0 ? void 0 : paramTypesOverrides.quoted) || ((_cfg$paramTypes2 = cfg.paramTypes) === null || _cfg$paramTypes2 === void 0 ? void 0 : _cfg$paramTypes2.quoted) || [],
      numbered: (paramTypesOverrides === null || paramTypesOverrides === void 0 ? void 0 : paramTypesOverrides.numbered) || ((_cfg$paramTypes3 = cfg.paramTypes) === null || _cfg$paramTypes3 === void 0 ? void 0 : _cfg$paramTypes3.numbered) || [],
      positional: typeof (paramTypesOverrides === null || paramTypesOverrides === void 0 ? void 0 : paramTypesOverrides.positional) === "boolean" ? paramTypesOverrides.positional : (_cfg$paramTypes4 = cfg.paramTypes) === null || _cfg$paramTypes4 === void 0 ? void 0 : _cfg$paramTypes4.positional,
      custom: (paramTypesOverrides === null || paramTypesOverrides === void 0 ? void 0 : paramTypesOverrides.custom) || ((_cfg$paramTypes5 = cfg.paramTypes) === null || _cfg$paramTypes5 === void 0 ? void 0 : _cfg$paramTypes5.custom) || []
    };
    return this.validRules([{
      type: TokenType.NAMED_PARAMETER,
      regex: parameter(paramTypes.named, identifierPattern(cfg.paramChars || cfg.identChars)),
      key: (v) => v.slice(1)
    }, {
      type: TokenType.QUOTED_PARAMETER,
      regex: parameter(paramTypes.quoted, stringPattern(cfg.identTypes)),
      key: (v) => (({
        tokenKey,
        quoteChar
      }) => tokenKey.replace(new RegExp(escapeRegExp("\\" + quoteChar), "gu"), quoteChar))({
        tokenKey: v.slice(2, -1),
        quoteChar: v.slice(-1)
      })
    }, {
      type: TokenType.NUMBERED_PARAMETER,
      regex: parameter(paramTypes.numbered, "[0-9]+"),
      key: (v) => v.slice(1)
    }, {
      type: TokenType.POSITIONAL_PARAMETER,
      regex: paramTypes.positional ? /[?]/y : void 0
    }, ...paramTypes.custom.map((customParam) => ({
      type: TokenType.CUSTOM_PARAMETER,
      regex: patternToRegex(customParam.regex),
      key: customParam.key ?? ((v) => v)
    }))]);
  }
  // filters out rules for token types whose regex is undefined
  validRules(rules) {
    return rules.filter((rule) => Boolean(rule.regex));
  }
};
var toCanonical = (v) => equalizeWhitespace(v.toUpperCase());

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/dialect.js
var cache = /* @__PURE__ */ new Map();
var createDialect = (options) => {
  let dialect = cache.get(options);
  if (!dialect) {
    dialect = dialectFromOptions(options);
    cache.set(options, dialect);
  }
  return dialect;
};
var dialectFromOptions = (dialectOptions) => ({
  tokenizer: new Tokenizer(dialectOptions.tokenizerOptions),
  formatOptions: processDialectFormatOptions(dialectOptions.formatOptions)
});
var processDialectFormatOptions = (options) => ({
  alwaysDenseOperators: options.alwaysDenseOperators || [],
  onelineClauses: Object.fromEntries(options.onelineClauses.map((name) => [name, true]))
});

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/formatter/config.js
function indentString(cfg) {
  if (cfg.indentStyle === "tabularLeft" || cfg.indentStyle === "tabularRight") {
    return " ".repeat(10);
  }
  if (cfg.useTabs) {
    return "	";
  }
  return " ".repeat(cfg.tabWidth);
}
function isTabularStyle(cfg) {
  return cfg.indentStyle === "tabularLeft" || cfg.indentStyle === "tabularRight";
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/formatter/Params.js
var Params = class {
  constructor(params) {
    this.params = params;
    this.index = 0;
  }
  /**
   * Returns param value that matches given placeholder with param key.
   */
  get({
    key,
    text
  }) {
    if (!this.params) {
      return text;
    }
    if (key) {
      return this.params[key];
    }
    return this.params[this.index++];
  }
  /**
   * Returns index of current positional parameter.
   */
  getPositionalParameterIndex() {
    return this.index;
  }
  /**
   * Sets index of current positional parameter.
   */
  setPositionalParameterIndex(i) {
    this.index = i;
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/parser/createParser.js
var import_nearley = __toESM(require_nearley(), 1);

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/lexer/disambiguateTokens.js
function disambiguateTokens(tokens) {
  return tokens.map(dotKeywordToIdent).map(funcNameToKeyword).map(identToArrayIdent).map(keywordToArrayKeyword);
}
var dotKeywordToIdent = (token, i, tokens) => {
  if (isReserved(token.type)) {
    const prevToken = prevNonCommentToken(tokens, i);
    if (prevToken && prevToken.text === ".") {
      return {
        ...token,
        type: TokenType.IDENTIFIER,
        text: token.raw
      };
    }
  }
  return token;
};
var funcNameToKeyword = (token, i, tokens) => {
  if (token.type === TokenType.RESERVED_FUNCTION_NAME) {
    const nextToken = nextNonCommentToken(tokens, i);
    if (!nextToken || !isOpenParen(nextToken)) {
      return {
        ...token,
        type: TokenType.RESERVED_KEYWORD
      };
    }
  }
  return token;
};
var identToArrayIdent = (token, i, tokens) => {
  if (token.type === TokenType.IDENTIFIER) {
    const nextToken = nextNonCommentToken(tokens, i);
    if (nextToken && isOpenBracket(nextToken)) {
      return {
        ...token,
        type: TokenType.ARRAY_IDENTIFIER
      };
    }
  }
  return token;
};
var keywordToArrayKeyword = (token, i, tokens) => {
  if (token.type === TokenType.RESERVED_KEYWORD) {
    const nextToken = nextNonCommentToken(tokens, i);
    if (nextToken && isOpenBracket(nextToken)) {
      return {
        ...token,
        type: TokenType.ARRAY_KEYWORD
      };
    }
  }
  return token;
};
var prevNonCommentToken = (tokens, index) => nextNonCommentToken(tokens, index, -1);
var nextNonCommentToken = (tokens, index, dir = 1) => {
  let i = 1;
  while (tokens[index + i * dir] && isComment(tokens[index + i * dir])) {
    i++;
  }
  return tokens[index + i * dir];
};
var isOpenParen = (t) => t.type === TokenType.OPEN_PAREN && t.text === "(";
var isOpenBracket = (t) => t.type === TokenType.OPEN_PAREN && t.text === "[";
var isComment = (t) => t.type === TokenType.BLOCK_COMMENT || t.type === TokenType.LINE_COMMENT;

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/parser/LexerAdapter.js
var LexerAdapter = class {
  index = 0;
  tokens = [];
  input = "";
  constructor(tokenize) {
    this.tokenize = tokenize;
  }
  reset(chunk, _info) {
    this.input = chunk;
    this.index = 0;
    this.tokens = this.tokenize(chunk);
  }
  next() {
    return this.tokens[this.index++];
  }
  save() {
  }
  formatError(token) {
    const {
      line,
      col
    } = lineColFromIndex(this.input, token.start);
    return `Parse error at token: ${token.text} at line ${line} column ${col}`;
  }
  has(name) {
    return name in TokenType;
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/parser/ast.js
var NodeType;
(function(NodeType2) {
  NodeType2["statement"] = "statement";
  NodeType2["clause"] = "clause";
  NodeType2["set_operation"] = "set_operation";
  NodeType2["function_call"] = "function_call";
  NodeType2["array_subscript"] = "array_subscript";
  NodeType2["property_access"] = "property_access";
  NodeType2["parenthesis"] = "parenthesis";
  NodeType2["between_predicate"] = "between_predicate";
  NodeType2["case_expression"] = "case_expression";
  NodeType2["case_when"] = "case_when";
  NodeType2["case_else"] = "case_else";
  NodeType2["limit_clause"] = "limit_clause";
  NodeType2["all_columns_asterisk"] = "all_columns_asterisk";
  NodeType2["literal"] = "literal";
  NodeType2["identifier"] = "identifier";
  NodeType2["keyword"] = "keyword";
  NodeType2["parameter"] = "parameter";
  NodeType2["operator"] = "operator";
  NodeType2["comma"] = "comma";
  NodeType2["line_comment"] = "line_comment";
  NodeType2["block_comment"] = "block_comment";
})(NodeType || (NodeType = {}));

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/parser/grammar.js
function id(d) {
  return d[0];
}
var lexer = new LexerAdapter((chunk) => []);
var unwrap = ([[el]]) => el;
var toKeywordNode = (token) => ({
  type: NodeType.keyword,
  tokenType: token.type,
  text: token.text,
  raw: token.raw
});
var addComments = (node, {
  leading,
  trailing
}) => {
  if (leading !== null && leading !== void 0 && leading.length) {
    node = {
      ...node,
      leadingComments: leading
    };
  }
  if (trailing !== null && trailing !== void 0 && trailing.length) {
    node = {
      ...node,
      trailingComments: trailing
    };
  }
  return node;
};
var addCommentsToArray = (nodes, {
  leading,
  trailing
}) => {
  if (leading !== null && leading !== void 0 && leading.length) {
    const [first, ...rest] = nodes;
    nodes = [addComments(first, {
      leading
    }), ...rest];
  }
  if (trailing !== null && trailing !== void 0 && trailing.length) {
    const lead = nodes.slice(0, -1);
    const last2 = nodes[nodes.length - 1];
    nodes = [...lead, addComments(last2, {
      trailing
    })];
  }
  return nodes;
};
var grammar = {
  Lexer: lexer,
  ParserRules: [{
    "name": "main$ebnf$1",
    "symbols": []
  }, {
    "name": "main$ebnf$1",
    "symbols": ["main$ebnf$1", "statement"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "main",
    "symbols": ["main$ebnf$1"],
    "postprocess": ([statements]) => {
      const last2 = statements[statements.length - 1];
      if (last2 && !last2.hasSemicolon) {
        return last2.children.length > 0 ? statements : statements.slice(0, -1);
      } else {
        return statements;
      }
    }
  }, {
    "name": "statement$subexpression$1",
    "symbols": [lexer.has("DELIMITER") ? {
      type: "DELIMITER"
    } : DELIMITER]
  }, {
    "name": "statement$subexpression$1",
    "symbols": [lexer.has("EOF") ? {
      type: "EOF"
    } : EOF]
  }, {
    "name": "statement",
    "symbols": ["expressions_or_clauses", "statement$subexpression$1"],
    "postprocess": ([children, [delimiter]]) => ({
      type: NodeType.statement,
      children,
      hasSemicolon: delimiter.type === TokenType.DELIMITER
    })
  }, {
    "name": "expressions_or_clauses$ebnf$1",
    "symbols": []
  }, {
    "name": "expressions_or_clauses$ebnf$1",
    "symbols": ["expressions_or_clauses$ebnf$1", "free_form_sql"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "expressions_or_clauses$ebnf$2",
    "symbols": []
  }, {
    "name": "expressions_or_clauses$ebnf$2",
    "symbols": ["expressions_or_clauses$ebnf$2", "clause"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "expressions_or_clauses",
    "symbols": ["expressions_or_clauses$ebnf$1", "expressions_or_clauses$ebnf$2"],
    "postprocess": ([expressions, clauses]) => [...expressions, ...clauses]
  }, {
    "name": "clause$subexpression$1",
    "symbols": ["limit_clause"]
  }, {
    "name": "clause$subexpression$1",
    "symbols": ["select_clause"]
  }, {
    "name": "clause$subexpression$1",
    "symbols": ["other_clause"]
  }, {
    "name": "clause$subexpression$1",
    "symbols": ["set_operation"]
  }, {
    "name": "clause",
    "symbols": ["clause$subexpression$1"],
    "postprocess": unwrap
  }, {
    "name": "limit_clause$ebnf$1$subexpression$1$ebnf$1",
    "symbols": ["free_form_sql"]
  }, {
    "name": "limit_clause$ebnf$1$subexpression$1$ebnf$1",
    "symbols": ["limit_clause$ebnf$1$subexpression$1$ebnf$1", "free_form_sql"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "limit_clause$ebnf$1$subexpression$1",
    "symbols": [lexer.has("COMMA") ? {
      type: "COMMA"
    } : COMMA, "limit_clause$ebnf$1$subexpression$1$ebnf$1"]
  }, {
    "name": "limit_clause$ebnf$1",
    "symbols": ["limit_clause$ebnf$1$subexpression$1"],
    "postprocess": id
  }, {
    "name": "limit_clause$ebnf$1",
    "symbols": [],
    "postprocess": () => null
  }, {
    "name": "limit_clause",
    "symbols": [lexer.has("LIMIT") ? {
      type: "LIMIT"
    } : LIMIT, "_", "expression_chain_", "limit_clause$ebnf$1"],
    "postprocess": ([limitToken, _, exp1, optional]) => {
      if (optional) {
        const [comma, exp2] = optional;
        return {
          type: NodeType.limit_clause,
          limitKw: addComments(toKeywordNode(limitToken), {
            trailing: _
          }),
          offset: exp1,
          count: exp2
        };
      } else {
        return {
          type: NodeType.limit_clause,
          limitKw: addComments(toKeywordNode(limitToken), {
            trailing: _
          }),
          count: exp1
        };
      }
    }
  }, {
    "name": "select_clause$subexpression$1$ebnf$1",
    "symbols": []
  }, {
    "name": "select_clause$subexpression$1$ebnf$1",
    "symbols": ["select_clause$subexpression$1$ebnf$1", "free_form_sql"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "select_clause$subexpression$1",
    "symbols": ["all_columns_asterisk", "select_clause$subexpression$1$ebnf$1"]
  }, {
    "name": "select_clause$subexpression$1$ebnf$2",
    "symbols": []
  }, {
    "name": "select_clause$subexpression$1$ebnf$2",
    "symbols": ["select_clause$subexpression$1$ebnf$2", "free_form_sql"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "select_clause$subexpression$1",
    "symbols": ["asteriskless_free_form_sql", "select_clause$subexpression$1$ebnf$2"]
  }, {
    "name": "select_clause",
    "symbols": [lexer.has("RESERVED_SELECT") ? {
      type: "RESERVED_SELECT"
    } : RESERVED_SELECT, "select_clause$subexpression$1"],
    "postprocess": ([nameToken, [exp, expressions]]) => ({
      type: NodeType.clause,
      nameKw: toKeywordNode(nameToken),
      children: [exp, ...expressions]
    })
  }, {
    "name": "select_clause",
    "symbols": [lexer.has("RESERVED_SELECT") ? {
      type: "RESERVED_SELECT"
    } : RESERVED_SELECT],
    "postprocess": ([nameToken]) => ({
      type: NodeType.clause,
      nameKw: toKeywordNode(nameToken),
      children: []
    })
  }, {
    "name": "all_columns_asterisk",
    "symbols": [lexer.has("ASTERISK") ? {
      type: "ASTERISK"
    } : ASTERISK],
    "postprocess": () => ({
      type: NodeType.all_columns_asterisk
    })
  }, {
    "name": "other_clause$ebnf$1",
    "symbols": []
  }, {
    "name": "other_clause$ebnf$1",
    "symbols": ["other_clause$ebnf$1", "free_form_sql"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "other_clause",
    "symbols": [lexer.has("RESERVED_CLAUSE") ? {
      type: "RESERVED_CLAUSE"
    } : RESERVED_CLAUSE, "other_clause$ebnf$1"],
    "postprocess": ([nameToken, children]) => ({
      type: NodeType.clause,
      nameKw: toKeywordNode(nameToken),
      children
    })
  }, {
    "name": "set_operation$ebnf$1",
    "symbols": []
  }, {
    "name": "set_operation$ebnf$1",
    "symbols": ["set_operation$ebnf$1", "free_form_sql"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "set_operation",
    "symbols": [lexer.has("RESERVED_SET_OPERATION") ? {
      type: "RESERVED_SET_OPERATION"
    } : RESERVED_SET_OPERATION, "set_operation$ebnf$1"],
    "postprocess": ([nameToken, children]) => ({
      type: NodeType.set_operation,
      nameKw: toKeywordNode(nameToken),
      children
    })
  }, {
    "name": "expression_chain_$ebnf$1",
    "symbols": ["expression_with_comments_"]
  }, {
    "name": "expression_chain_$ebnf$1",
    "symbols": ["expression_chain_$ebnf$1", "expression_with_comments_"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "expression_chain_",
    "symbols": ["expression_chain_$ebnf$1"],
    "postprocess": id
  }, {
    "name": "expression_chain$ebnf$1",
    "symbols": []
  }, {
    "name": "expression_chain$ebnf$1",
    "symbols": ["expression_chain$ebnf$1", "_expression_with_comments"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "expression_chain",
    "symbols": ["expression", "expression_chain$ebnf$1"],
    "postprocess": ([expr, chain]) => [expr, ...chain]
  }, {
    "name": "andless_expression_chain$ebnf$1",
    "symbols": []
  }, {
    "name": "andless_expression_chain$ebnf$1",
    "symbols": ["andless_expression_chain$ebnf$1", "_andless_expression_with_comments"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "andless_expression_chain",
    "symbols": ["andless_expression", "andless_expression_chain$ebnf$1"],
    "postprocess": ([expr, chain]) => [expr, ...chain]
  }, {
    "name": "expression_with_comments_",
    "symbols": ["expression", "_"],
    "postprocess": ([expr, _]) => addComments(expr, {
      trailing: _
    })
  }, {
    "name": "_expression_with_comments",
    "symbols": ["_", "expression"],
    "postprocess": ([_, expr]) => addComments(expr, {
      leading: _
    })
  }, {
    "name": "_andless_expression_with_comments",
    "symbols": ["_", "andless_expression"],
    "postprocess": ([_, expr]) => addComments(expr, {
      leading: _
    })
  }, {
    "name": "free_form_sql$subexpression$1",
    "symbols": ["asteriskless_free_form_sql"]
  }, {
    "name": "free_form_sql$subexpression$1",
    "symbols": ["asterisk"]
  }, {
    "name": "free_form_sql",
    "symbols": ["free_form_sql$subexpression$1"],
    "postprocess": unwrap
  }, {
    "name": "asteriskless_free_form_sql$subexpression$1",
    "symbols": ["asteriskless_andless_expression"]
  }, {
    "name": "asteriskless_free_form_sql$subexpression$1",
    "symbols": ["logic_operator"]
  }, {
    "name": "asteriskless_free_form_sql$subexpression$1",
    "symbols": ["between_predicate"]
  }, {
    "name": "asteriskless_free_form_sql$subexpression$1",
    "symbols": ["comma"]
  }, {
    "name": "asteriskless_free_form_sql$subexpression$1",
    "symbols": ["comment"]
  }, {
    "name": "asteriskless_free_form_sql$subexpression$1",
    "symbols": ["other_keyword"]
  }, {
    "name": "asteriskless_free_form_sql",
    "symbols": ["asteriskless_free_form_sql$subexpression$1"],
    "postprocess": unwrap
  }, {
    "name": "expression$subexpression$1",
    "symbols": ["andless_expression"]
  }, {
    "name": "expression$subexpression$1",
    "symbols": ["logic_operator"]
  }, {
    "name": "expression",
    "symbols": ["expression$subexpression$1"],
    "postprocess": unwrap
  }, {
    "name": "andless_expression$subexpression$1",
    "symbols": ["asteriskless_andless_expression"]
  }, {
    "name": "andless_expression$subexpression$1",
    "symbols": ["asterisk"]
  }, {
    "name": "andless_expression",
    "symbols": ["andless_expression$subexpression$1"],
    "postprocess": unwrap
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["array_subscript"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["case_expression"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["function_call"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["property_access"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["parenthesis"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["curly_braces"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["square_brackets"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["operator"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["identifier"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["parameter"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["literal"]
  }, {
    "name": "asteriskless_andless_expression$subexpression$1",
    "symbols": ["keyword"]
  }, {
    "name": "asteriskless_andless_expression",
    "symbols": ["asteriskless_andless_expression$subexpression$1"],
    "postprocess": unwrap
  }, {
    "name": "array_subscript",
    "symbols": [lexer.has("ARRAY_IDENTIFIER") ? {
      type: "ARRAY_IDENTIFIER"
    } : ARRAY_IDENTIFIER, "_", "square_brackets"],
    "postprocess": ([arrayToken, _, brackets]) => ({
      type: NodeType.array_subscript,
      array: addComments({
        type: NodeType.identifier,
        text: arrayToken.text
      }, {
        trailing: _
      }),
      parenthesis: brackets
    })
  }, {
    "name": "array_subscript",
    "symbols": [lexer.has("ARRAY_KEYWORD") ? {
      type: "ARRAY_KEYWORD"
    } : ARRAY_KEYWORD, "_", "square_brackets"],
    "postprocess": ([arrayToken, _, brackets]) => ({
      type: NodeType.array_subscript,
      array: addComments(toKeywordNode(arrayToken), {
        trailing: _
      }),
      parenthesis: brackets
    })
  }, {
    "name": "function_call",
    "symbols": [lexer.has("RESERVED_FUNCTION_NAME") ? {
      type: "RESERVED_FUNCTION_NAME"
    } : RESERVED_FUNCTION_NAME, "_", "parenthesis"],
    "postprocess": ([nameToken, _, parens]) => ({
      type: NodeType.function_call,
      nameKw: addComments(toKeywordNode(nameToken), {
        trailing: _
      }),
      parenthesis: parens
    })
  }, {
    "name": "parenthesis",
    "symbols": [{
      "literal": "("
    }, "expressions_or_clauses", {
      "literal": ")"
    }],
    "postprocess": ([open, children, close]) => ({
      type: NodeType.parenthesis,
      children,
      openParen: "(",
      closeParen: ")"
    })
  }, {
    "name": "curly_braces$ebnf$1",
    "symbols": []
  }, {
    "name": "curly_braces$ebnf$1",
    "symbols": ["curly_braces$ebnf$1", "free_form_sql"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "curly_braces",
    "symbols": [{
      "literal": "{"
    }, "curly_braces$ebnf$1", {
      "literal": "}"
    }],
    "postprocess": ([open, children, close]) => ({
      type: NodeType.parenthesis,
      children,
      openParen: "{",
      closeParen: "}"
    })
  }, {
    "name": "square_brackets$ebnf$1",
    "symbols": []
  }, {
    "name": "square_brackets$ebnf$1",
    "symbols": ["square_brackets$ebnf$1", "free_form_sql"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "square_brackets",
    "symbols": [{
      "literal": "["
    }, "square_brackets$ebnf$1", {
      "literal": "]"
    }],
    "postprocess": ([open, children, close]) => ({
      type: NodeType.parenthesis,
      children,
      openParen: "[",
      closeParen: "]"
    })
  }, {
    "name": "property_access$subexpression$1",
    "symbols": ["identifier"]
  }, {
    "name": "property_access$subexpression$1",
    "symbols": ["array_subscript"]
  }, {
    "name": "property_access$subexpression$1",
    "symbols": ["all_columns_asterisk"]
  }, {
    "name": "property_access",
    "symbols": ["expression", "_", lexer.has("DOT") ? {
      type: "DOT"
    } : DOT, "_", "property_access$subexpression$1"],
    "postprocess": (
      // Allowing property to be <array_subscript> is currently a hack.
      // A better way would be to allow <property_access> on the left side of array_subscript,
      // but we currently can't do that because of another hack that requires
      // %ARRAY_IDENTIFIER on the left side of <array_subscript>.
      ([object, _1, dot, _2, [property]]) => {
        return {
          type: NodeType.property_access,
          object: addComments(object, {
            trailing: _1
          }),
          property: addComments(property, {
            leading: _2
          })
        };
      }
    )
  }, {
    "name": "between_predicate",
    "symbols": [lexer.has("BETWEEN") ? {
      type: "BETWEEN"
    } : BETWEEN, "_", "andless_expression_chain", "_", lexer.has("AND") ? {
      type: "AND"
    } : AND, "_", "andless_expression"],
    "postprocess": ([betweenToken, _1, expr1, _2, andToken, _3, expr2]) => ({
      type: NodeType.between_predicate,
      betweenKw: toKeywordNode(betweenToken),
      expr1: addCommentsToArray(expr1, {
        leading: _1,
        trailing: _2
      }),
      andKw: toKeywordNode(andToken),
      expr2: [addComments(expr2, {
        leading: _3
      })]
    })
  }, {
    "name": "case_expression$ebnf$1",
    "symbols": ["expression_chain_"],
    "postprocess": id
  }, {
    "name": "case_expression$ebnf$1",
    "symbols": [],
    "postprocess": () => null
  }, {
    "name": "case_expression$ebnf$2",
    "symbols": []
  }, {
    "name": "case_expression$ebnf$2",
    "symbols": ["case_expression$ebnf$2", "case_clause"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "case_expression",
    "symbols": [lexer.has("CASE") ? {
      type: "CASE"
    } : CASE, "_", "case_expression$ebnf$1", "case_expression$ebnf$2", lexer.has("END") ? {
      type: "END"
    } : END],
    "postprocess": ([caseToken, _, expr, clauses, endToken]) => ({
      type: NodeType.case_expression,
      caseKw: addComments(toKeywordNode(caseToken), {
        trailing: _
      }),
      endKw: toKeywordNode(endToken),
      expr: expr || [],
      clauses
    })
  }, {
    "name": "case_clause",
    "symbols": [lexer.has("WHEN") ? {
      type: "WHEN"
    } : WHEN, "_", "expression_chain_", lexer.has("THEN") ? {
      type: "THEN"
    } : THEN, "_", "expression_chain_"],
    "postprocess": ([whenToken, _1, cond, thenToken, _2, expr]) => ({
      type: NodeType.case_when,
      whenKw: addComments(toKeywordNode(whenToken), {
        trailing: _1
      }),
      thenKw: addComments(toKeywordNode(thenToken), {
        trailing: _2
      }),
      condition: cond,
      result: expr
    })
  }, {
    "name": "case_clause",
    "symbols": [lexer.has("ELSE") ? {
      type: "ELSE"
    } : ELSE, "_", "expression_chain_"],
    "postprocess": ([elseToken, _, expr]) => ({
      type: NodeType.case_else,
      elseKw: addComments(toKeywordNode(elseToken), {
        trailing: _
      }),
      result: expr
    })
  }, {
    "name": "comma$subexpression$1",
    "symbols": [lexer.has("COMMA") ? {
      type: "COMMA"
    } : COMMA]
  }, {
    "name": "comma",
    "symbols": ["comma$subexpression$1"],
    "postprocess": ([[token]]) => ({
      type: NodeType.comma
    })
  }, {
    "name": "asterisk$subexpression$1",
    "symbols": [lexer.has("ASTERISK") ? {
      type: "ASTERISK"
    } : ASTERISK]
  }, {
    "name": "asterisk",
    "symbols": ["asterisk$subexpression$1"],
    "postprocess": ([[token]]) => ({
      type: NodeType.operator,
      text: token.text
    })
  }, {
    "name": "operator$subexpression$1",
    "symbols": [lexer.has("OPERATOR") ? {
      type: "OPERATOR"
    } : OPERATOR]
  }, {
    "name": "operator",
    "symbols": ["operator$subexpression$1"],
    "postprocess": ([[token]]) => ({
      type: NodeType.operator,
      text: token.text
    })
  }, {
    "name": "identifier$subexpression$1",
    "symbols": [lexer.has("IDENTIFIER") ? {
      type: "IDENTIFIER"
    } : IDENTIFIER]
  }, {
    "name": "identifier$subexpression$1",
    "symbols": [lexer.has("QUOTED_IDENTIFIER") ? {
      type: "QUOTED_IDENTIFIER"
    } : QUOTED_IDENTIFIER]
  }, {
    "name": "identifier$subexpression$1",
    "symbols": [lexer.has("VARIABLE") ? {
      type: "VARIABLE"
    } : VARIABLE]
  }, {
    "name": "identifier",
    "symbols": ["identifier$subexpression$1"],
    "postprocess": ([[token]]) => ({
      type: NodeType.identifier,
      text: token.text
    })
  }, {
    "name": "parameter$subexpression$1",
    "symbols": [lexer.has("NAMED_PARAMETER") ? {
      type: "NAMED_PARAMETER"
    } : NAMED_PARAMETER]
  }, {
    "name": "parameter$subexpression$1",
    "symbols": [lexer.has("QUOTED_PARAMETER") ? {
      type: "QUOTED_PARAMETER"
    } : QUOTED_PARAMETER]
  }, {
    "name": "parameter$subexpression$1",
    "symbols": [lexer.has("NUMBERED_PARAMETER") ? {
      type: "NUMBERED_PARAMETER"
    } : NUMBERED_PARAMETER]
  }, {
    "name": "parameter$subexpression$1",
    "symbols": [lexer.has("POSITIONAL_PARAMETER") ? {
      type: "POSITIONAL_PARAMETER"
    } : POSITIONAL_PARAMETER]
  }, {
    "name": "parameter$subexpression$1",
    "symbols": [lexer.has("CUSTOM_PARAMETER") ? {
      type: "CUSTOM_PARAMETER"
    } : CUSTOM_PARAMETER]
  }, {
    "name": "parameter",
    "symbols": ["parameter$subexpression$1"],
    "postprocess": ([[token]]) => ({
      type: NodeType.parameter,
      key: token.key,
      text: token.text
    })
  }, {
    "name": "literal$subexpression$1",
    "symbols": [lexer.has("NUMBER") ? {
      type: "NUMBER"
    } : NUMBER]
  }, {
    "name": "literal$subexpression$1",
    "symbols": [lexer.has("STRING") ? {
      type: "STRING"
    } : STRING]
  }, {
    "name": "literal",
    "symbols": ["literal$subexpression$1"],
    "postprocess": ([[token]]) => ({
      type: NodeType.literal,
      text: token.text
    })
  }, {
    "name": "keyword$subexpression$1",
    "symbols": [lexer.has("RESERVED_KEYWORD") ? {
      type: "RESERVED_KEYWORD"
    } : RESERVED_KEYWORD]
  }, {
    "name": "keyword$subexpression$1",
    "symbols": [lexer.has("RESERVED_PHRASE") ? {
      type: "RESERVED_PHRASE"
    } : RESERVED_PHRASE]
  }, {
    "name": "keyword$subexpression$1",
    "symbols": [lexer.has("RESERVED_JOIN") ? {
      type: "RESERVED_JOIN"
    } : RESERVED_JOIN]
  }, {
    "name": "keyword",
    "symbols": ["keyword$subexpression$1"],
    "postprocess": ([[token]]) => toKeywordNode(token)
  }, {
    "name": "logic_operator$subexpression$1",
    "symbols": [lexer.has("AND") ? {
      type: "AND"
    } : AND]
  }, {
    "name": "logic_operator$subexpression$1",
    "symbols": [lexer.has("OR") ? {
      type: "OR"
    } : OR]
  }, {
    "name": "logic_operator$subexpression$1",
    "symbols": [lexer.has("XOR") ? {
      type: "XOR"
    } : XOR]
  }, {
    "name": "logic_operator",
    "symbols": ["logic_operator$subexpression$1"],
    "postprocess": ([[token]]) => toKeywordNode(token)
  }, {
    "name": "other_keyword$subexpression$1",
    "symbols": [lexer.has("WHEN") ? {
      type: "WHEN"
    } : WHEN]
  }, {
    "name": "other_keyword$subexpression$1",
    "symbols": [lexer.has("THEN") ? {
      type: "THEN"
    } : THEN]
  }, {
    "name": "other_keyword$subexpression$1",
    "symbols": [lexer.has("ELSE") ? {
      type: "ELSE"
    } : ELSE]
  }, {
    "name": "other_keyword$subexpression$1",
    "symbols": [lexer.has("END") ? {
      type: "END"
    } : END]
  }, {
    "name": "other_keyword",
    "symbols": ["other_keyword$subexpression$1"],
    "postprocess": ([[token]]) => toKeywordNode(token)
  }, {
    "name": "_$ebnf$1",
    "symbols": []
  }, {
    "name": "_$ebnf$1",
    "symbols": ["_$ebnf$1", "comment"],
    "postprocess": (d) => d[0].concat([d[1]])
  }, {
    "name": "_",
    "symbols": ["_$ebnf$1"],
    "postprocess": ([comments]) => comments
  }, {
    "name": "comment",
    "symbols": [lexer.has("LINE_COMMENT") ? {
      type: "LINE_COMMENT"
    } : LINE_COMMENT],
    "postprocess": ([token]) => ({
      type: NodeType.line_comment,
      text: token.text,
      precedingWhitespace: token.precedingWhitespace
    })
  }, {
    "name": "comment",
    "symbols": [lexer.has("BLOCK_COMMENT") ? {
      type: "BLOCK_COMMENT"
    } : BLOCK_COMMENT],
    "postprocess": ([token]) => ({
      type: NodeType.block_comment,
      text: token.text,
      precedingWhitespace: token.precedingWhitespace
    })
  }],
  ParserStart: "main"
};
var grammar_default = grammar;

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/parser/createParser.js
var {
  Parser: NearleyParser,
  Grammar
} = import_nearley.default;
function createParser(tokenizer) {
  let paramTypesOverrides = {};
  const lexer2 = new LexerAdapter((chunk) => [...disambiguateTokens(tokenizer.tokenize(chunk, paramTypesOverrides)), createEofToken(chunk.length)]);
  const parser = new NearleyParser(Grammar.fromCompiled(grammar_default), {
    lexer: lexer2
  });
  return {
    parse: (sql2, paramTypes) => {
      paramTypesOverrides = paramTypes;
      const {
        results
      } = parser.feed(sql2);
      if (results.length === 1) {
        return results[0];
      } else if (results.length === 0) {
        throw new Error("Parse error: Invalid SQL");
      } else {
        throw new Error(`Parse error: Ambiguous grammar
${JSON.stringify(results, void 0, 2)}`);
      }
    }
  };
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/formatter/formatCommaPositions.js
var PRECEDING_WHITESPACE_REGEX = /^\s+/u;
function formatCommaPositions(query, commaPosition, indent) {
  return groupCommaDelimitedLines(query.split("\n")).flatMap((commaLines) => {
    if (commaLines.length === 1) {
      return commaLines;
    } else if (commaPosition === "tabular") {
      return formatTabular(commaLines);
    } else if (commaPosition === "before") {
      return formatBefore(commaLines, indent);
    } else {
      throw new Error(`Unexpected commaPosition: ${commaPosition}`);
    }
  }).join("\n");
}
function groupCommaDelimitedLines(lines) {
  const groups = [];
  for (let i = 0; i < lines.length; i++) {
    const group = [lines[i]];
    while (lines[i].match(/.*,(\s*(--.*)?$)/)) {
      i++;
      group.push(lines[i]);
    }
    groups.push(group);
  }
  return groups;
}
function formatTabular(commaLines) {
  const commaPosition = maxLength(trimTrailingComments(commaLines)) - 1;
  return commaLines.map((line, i) => {
    if (i === commaLines.length - 1) {
      return line;
    }
    return indentComma(line, commaPosition);
  });
}
function indentComma(line, commaPosition) {
  const [, code, comment] = line.match(/^(.*?),(\s*--.*)?$/) || [];
  const spaces = " ".repeat(commaPosition - code.length);
  return `${code}${spaces},${comment ?? ""}`;
}
function formatBefore(commaLines, indent) {
  return trimTrailingCommas(commaLines).map((line, i) => {
    if (i === 0) {
      return line;
    }
    const [whitespace] = line.match(PRECEDING_WHITESPACE_REGEX) || [""];
    return removeLastIndent(whitespace, indent) + indent.replace(/ {2}$/, ", ") + // add comma to the end of last indent
    line.trimStart();
  });
}
function removeLastIndent(whitespace, indent) {
  return whitespace.replace(new RegExp(indent + "$"), "");
}
function trimTrailingCommas(lines) {
  return lines.map((line) => line.replace(/,(\s*(--.*)?$)/, "$1"));
}
function trimTrailingComments(lines) {
  return lines.map((line) => line.replace(/\s*--.*/, ""));
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/formatter/formatAliasPositions.js
function formatAliasPositions(query) {
  const lines = query.split("\n");
  let newQuery = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^\s*SELECT/i)) {
      let aliasLines = [];
      if (lines[i].match(/.*,$/)) {
        aliasLines = [lines[i]];
      } else {
        newQuery.push(lines[i]);
        if (lines[i].match(/^\s*SELECT\s+.+(?!,$)/i)) {
          continue;
        }
        aliasLines.push(lines[++i]);
      }
      while (lines[i++].match(/.*,$/)) {
        aliasLines.push(lines[i]);
      }
      const splitLines = aliasLines.map((line) => ({
        line,
        matches: line.match(/(^.*?\S) (AS )?(\S+,?$)/i)
      })).map(({
        line,
        matches
      }) => {
        if (!matches) {
          return {
            precedingText: line
          };
        }
        return {
          precedingText: matches[1],
          as: matches[2],
          alias: matches[3]
        };
      });
      const aliasMaxLength = maxLength(splitLines.map(({
        precedingText
      }) => precedingText.replace(/\s*,\s*$/, "")));
      aliasLines = splitLines.map(({
        precedingText,
        as,
        alias
      }) => precedingText + (alias ? " ".repeat(aliasMaxLength - precedingText.length + 1) + (as ?? "") + alias : ""));
      newQuery = [...newQuery, ...aliasLines];
    }
    newQuery.push(lines[i]);
  }
  return newQuery.join("\n");
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/formatter/Layout.js
var WS;
(function(WS2) {
  WS2[WS2["SPACE"] = 0] = "SPACE";
  WS2[WS2["NO_SPACE"] = 1] = "NO_SPACE";
  WS2[WS2["NO_NEWLINE"] = 2] = "NO_NEWLINE";
  WS2[WS2["NEWLINE"] = 3] = "NEWLINE";
  WS2[WS2["MANDATORY_NEWLINE"] = 4] = "MANDATORY_NEWLINE";
  WS2[WS2["INDENT"] = 5] = "INDENT";
  WS2[WS2["SINGLE_INDENT"] = 6] = "SINGLE_INDENT";
})(WS || (WS = {}));
var Layout = class {
  items = [];
  constructor(indentation) {
    this.indentation = indentation;
  }
  /**
   * Appends token strings and whitespace modifications to SQL string.
   */
  add(...items) {
    for (const item of items) {
      switch (item) {
        case WS.SPACE:
          this.items.push(WS.SPACE);
          break;
        case WS.NO_SPACE:
          this.trimHorizontalWhitespace();
          break;
        case WS.NO_NEWLINE:
          this.trimWhitespace();
          break;
        case WS.NEWLINE:
          this.trimHorizontalWhitespace();
          this.addNewline(WS.NEWLINE);
          break;
        case WS.MANDATORY_NEWLINE:
          this.trimHorizontalWhitespace();
          this.addNewline(WS.MANDATORY_NEWLINE);
          break;
        case WS.INDENT:
          this.addIndentation();
          break;
        case WS.SINGLE_INDENT:
          this.items.push(WS.SINGLE_INDENT);
          break;
        default:
          this.items.push(item);
      }
    }
  }
  trimHorizontalWhitespace() {
    while (isHorizontalWhitespace(last(this.items))) {
      this.items.pop();
    }
  }
  trimWhitespace() {
    while (isRemovableWhitespace(last(this.items))) {
      this.items.pop();
    }
  }
  addNewline(newline) {
    if (this.items.length > 0) {
      switch (last(this.items)) {
        case WS.NEWLINE:
          this.items.pop();
          this.items.push(newline);
          break;
        case WS.MANDATORY_NEWLINE:
          break;
        default:
          this.items.push(newline);
          break;
      }
    }
  }
  addIndentation() {
    for (let i = 0; i < this.indentation.getLevel(); i++) {
      this.items.push(WS.SINGLE_INDENT);
    }
  }
  /**
   * Returns the final SQL string.
   */
  toString() {
    return this.items.map((item) => this.itemToString(item)).join("");
  }
  /**
   * Returns the internal layout data
   */
  getLayoutItems() {
    return this.items;
  }
  itemToString(item) {
    switch (item) {
      case WS.SPACE:
        return " ";
      case WS.NEWLINE:
      case WS.MANDATORY_NEWLINE:
        return "\n";
      case WS.SINGLE_INDENT:
        return this.indentation.getSingleIndent();
      default:
        return item;
    }
  }
};
var isHorizontalWhitespace = (item) => item === WS.SPACE || item === WS.SINGLE_INDENT;
var isRemovableWhitespace = (item) => item === WS.SPACE || item === WS.SINGLE_INDENT || item === WS.NEWLINE;

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/formatter/tabularStyle.js
function toTabularFormat(tokenText, indentStyle) {
  if (indentStyle === "standard") {
    return tokenText;
  }
  let tail = [];
  if (tokenText.length >= 10 && tokenText.includes(" ")) {
    [tokenText, ...tail] = tokenText.split(" ");
  }
  if (indentStyle === "tabularLeft") {
    tokenText = tokenText.padEnd(9, " ");
  } else {
    tokenText = tokenText.padStart(9, " ");
  }
  return tokenText + ["", ...tail].join(" ");
}
function isTabularToken(type) {
  return isLogicalOperator(type) || type === TokenType.RESERVED_CLAUSE || type === TokenType.RESERVED_SELECT || type === TokenType.RESERVED_SET_OPERATION || type === TokenType.RESERVED_JOIN || type === TokenType.LIMIT;
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/formatter/Indentation.js
var INDENT_TYPE_TOP_LEVEL = "top-level";
var INDENT_TYPE_BLOCK_LEVEL = "block-level";
var Indentation = class {
  indentTypes = [];
  /**
   * @param {string} indent A string to indent with
   */
  constructor(indent) {
    this.indent = indent;
  }
  /**
   * Returns indentation string for single indentation step.
   */
  getSingleIndent() {
    return this.indent;
  }
  /**
   * Returns current indentation level
   */
  getLevel() {
    return this.indentTypes.length;
  }
  /**
   * Increases indentation by one top-level indent.
   */
  increaseTopLevel() {
    this.indentTypes.push(INDENT_TYPE_TOP_LEVEL);
  }
  /**
   * Increases indentation by one block-level indent.
   */
  increaseBlockLevel() {
    this.indentTypes.push(INDENT_TYPE_BLOCK_LEVEL);
  }
  /**
   * Decreases indentation by one top-level indent.
   * Does nothing when the previous indent is not top-level.
   */
  decreaseTopLevel() {
    if (this.indentTypes.length > 0 && last(this.indentTypes) === INDENT_TYPE_TOP_LEVEL) {
      this.indentTypes.pop();
    }
  }
  /**
   * Decreases indentation by one block-level indent.
   * If there are top-level indents within the block-level indent,
   * throws away these as well.
   */
  decreaseBlockLevel() {
    while (this.indentTypes.length > 0) {
      const type = this.indentTypes.pop();
      if (type !== INDENT_TYPE_TOP_LEVEL) {
        break;
      }
    }
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/formatter/InlineLayout.js
var InlineLayout = class extends Layout {
  length = 0;
  // Keeps track of the trailing whitespace,
  // so that we can decrease length when encountering WS.NO_SPACE,
  // but only when there actually is a space to remove.
  trailingSpace = false;
  constructor(expressionWidth) {
    super(new Indentation(""));
    this.expressionWidth = expressionWidth;
  }
  add(...items) {
    items.forEach((item) => this.addToLength(item));
    if (this.length > this.expressionWidth) {
      throw new InlineLayoutError();
    }
    super.add(...items);
  }
  addToLength(item) {
    if (typeof item === "string") {
      this.length += item.length;
      this.trailingSpace = false;
    } else if (item === WS.MANDATORY_NEWLINE || item === WS.NEWLINE) {
      throw new InlineLayoutError();
    } else if (item === WS.INDENT || item === WS.SINGLE_INDENT || item === WS.SPACE) {
      if (!this.trailingSpace) {
        this.length++;
        this.trailingSpace = true;
      }
    } else if (item === WS.NO_NEWLINE || item === WS.NO_SPACE) {
      if (this.trailingSpace) {
        this.trailingSpace = false;
        this.length--;
      }
    }
  }
};
var InlineLayoutError = class extends Error {
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/formatter/ExpressionFormatter.js
var ExpressionFormatter = class {
  inline = false;
  nodes = [];
  index = -1;
  constructor({
    cfg,
    dialectCfg,
    params,
    layout,
    inline = false
  }) {
    this.cfg = cfg;
    this.dialectCfg = dialectCfg;
    this.inline = inline;
    this.params = params;
    this.layout = layout;
  }
  format(nodes) {
    this.nodes = nodes;
    for (this.index = 0; this.index < this.nodes.length; this.index++) {
      this.formatNode(this.nodes[this.index]);
    }
    return this.layout;
  }
  formatNode(node) {
    this.formatComments(node.leadingComments);
    this.formatNodeWithoutComments(node);
    this.formatComments(node.trailingComments);
  }
  formatNodeWithoutComments(node) {
    switch (node.type) {
      case NodeType.function_call:
        return this.formatFunctionCall(node);
      case NodeType.array_subscript:
        return this.formatArraySubscript(node);
      case NodeType.property_access:
        return this.formatPropertyAccess(node);
      case NodeType.parenthesis:
        return this.formatParenthesis(node);
      case NodeType.between_predicate:
        return this.formatBetweenPredicate(node);
      case NodeType.case_expression:
        return this.formatCaseExpression(node);
      case NodeType.case_when:
        return this.formatCaseWhen(node);
      case NodeType.case_else:
        return this.formatCaseElse(node);
      case NodeType.clause:
        return this.formatClause(node);
      case NodeType.set_operation:
        return this.formatSetOperation(node);
      case NodeType.limit_clause:
        return this.formatLimitClause(node);
      case NodeType.all_columns_asterisk:
        return this.formatAllColumnsAsterisk(node);
      case NodeType.literal:
        return this.formatLiteral(node);
      case NodeType.identifier:
        return this.formatIdentifier(node);
      case NodeType.parameter:
        return this.formatParameter(node);
      case NodeType.operator:
        return this.formatOperator(node);
      case NodeType.comma:
        return this.formatComma(node);
      case NodeType.line_comment:
        return this.formatLineComment(node);
      case NodeType.block_comment:
        return this.formatBlockComment(node);
      case NodeType.keyword:
        return this.formatKeywordNode(node);
    }
  }
  formatFunctionCall(node) {
    this.withComments(node.nameKw, () => {
      this.layout.add(this.showKw(node.nameKw));
    });
    this.formatNode(node.parenthesis);
  }
  formatArraySubscript(node) {
    this.withComments(node.array, () => {
      this.layout.add(node.array.type === NodeType.keyword ? this.showKw(node.array) : node.array.text);
    });
    this.formatNode(node.parenthesis);
  }
  formatPropertyAccess(node) {
    this.formatNode(node.object);
    this.layout.add(WS.NO_SPACE, ".");
    this.formatNode(node.property);
  }
  formatParenthesis(node) {
    const inlineLayout = this.formatInlineExpression(node.children);
    if (inlineLayout) {
      this.layout.add(node.openParen);
      this.layout.add(...inlineLayout.getLayoutItems());
      this.layout.add(WS.NO_SPACE, node.closeParen, WS.SPACE);
    } else {
      this.layout.add(node.openParen, WS.NEWLINE);
      if (isTabularStyle(this.cfg)) {
        this.layout.add(WS.INDENT);
        this.layout = this.formatSubExpression(node.children);
      } else {
        this.layout.indentation.increaseBlockLevel();
        this.layout.add(WS.INDENT);
        this.layout = this.formatSubExpression(node.children);
        this.layout.indentation.decreaseBlockLevel();
      }
      this.layout.add(WS.NEWLINE, WS.INDENT, node.closeParen, WS.SPACE);
    }
  }
  formatBetweenPredicate(node) {
    this.layout.add(this.showKw(node.betweenKw), WS.SPACE);
    this.layout = this.formatSubExpression(node.expr1);
    this.layout.add(WS.NO_SPACE, WS.SPACE, this.showNonTabularKw(node.andKw), WS.SPACE);
    this.layout = this.formatSubExpression(node.expr2);
    this.layout.add(WS.SPACE);
  }
  formatCaseExpression(node) {
    this.formatNode(node.caseKw);
    this.layout.indentation.increaseBlockLevel();
    this.layout = this.formatSubExpression(node.expr);
    this.layout = this.formatSubExpression(node.clauses);
    this.layout.indentation.decreaseBlockLevel();
    this.layout.add(WS.NEWLINE, WS.INDENT);
    this.formatNode(node.endKw);
  }
  formatCaseWhen(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT);
    this.formatNode(node.whenKw);
    this.layout = this.formatSubExpression(node.condition);
    this.formatNode(node.thenKw);
    this.layout = this.formatSubExpression(node.result);
  }
  formatCaseElse(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT);
    this.formatNode(node.elseKw);
    this.layout = this.formatSubExpression(node.result);
  }
  formatClause(node) {
    if (this.isOnelineClause(node)) {
      this.formatClauseInOnelineStyle(node);
    } else if (isTabularStyle(this.cfg)) {
      this.formatClauseInTabularStyle(node);
    } else {
      this.formatClauseInIndentedStyle(node);
    }
  }
  isOnelineClause(node) {
    return this.dialectCfg.onelineClauses[node.nameKw.text];
  }
  formatClauseInIndentedStyle(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node.nameKw), WS.NEWLINE);
    this.layout.indentation.increaseTopLevel();
    this.layout.add(WS.INDENT);
    this.layout = this.formatSubExpression(node.children);
    this.layout.indentation.decreaseTopLevel();
  }
  formatClauseInOnelineStyle(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node.nameKw), WS.SPACE);
    this.layout = this.formatSubExpression(node.children);
  }
  formatClauseInTabularStyle(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node.nameKw), WS.SPACE);
    this.layout.indentation.increaseTopLevel();
    this.layout = this.formatSubExpression(node.children);
    this.layout.indentation.decreaseTopLevel();
  }
  formatSetOperation(node) {
    this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node.nameKw), WS.NEWLINE);
    this.layout.add(WS.INDENT);
    this.layout = this.formatSubExpression(node.children);
  }
  formatLimitClause(node) {
    this.withComments(node.limitKw, () => {
      this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node.limitKw));
    });
    this.layout.indentation.increaseTopLevel();
    if (isTabularStyle(this.cfg)) {
      this.layout.add(WS.SPACE);
    } else {
      this.layout.add(WS.NEWLINE, WS.INDENT);
    }
    if (node.offset) {
      this.layout = this.formatSubExpression(node.offset);
      this.layout.add(WS.NO_SPACE, ",", WS.SPACE);
      this.layout = this.formatSubExpression(node.count);
    } else {
      this.layout = this.formatSubExpression(node.count);
    }
    this.layout.indentation.decreaseTopLevel();
  }
  formatAllColumnsAsterisk(_node) {
    this.layout.add("*", WS.SPACE);
  }
  formatLiteral(node) {
    this.layout.add(node.text, WS.SPACE);
  }
  formatIdentifier(node) {
    this.layout.add(node.text, WS.SPACE);
  }
  formatParameter(node) {
    this.layout.add(this.params.get(node), WS.SPACE);
  }
  formatOperator({
    text
  }) {
    if (this.cfg.denseOperators || this.dialectCfg.alwaysDenseOperators.includes(text)) {
      this.layout.add(WS.NO_SPACE, text);
    } else if (text === ":") {
      this.layout.add(WS.NO_SPACE, text, WS.SPACE);
    } else {
      this.layout.add(text, WS.SPACE);
    }
  }
  formatComma(_node) {
    if (!this.inline) {
      this.layout.add(WS.NO_SPACE, ",", WS.NEWLINE, WS.INDENT);
    } else {
      this.layout.add(WS.NO_SPACE, ",", WS.SPACE);
    }
  }
  withComments(node, fn) {
    this.formatComments(node.leadingComments);
    fn();
    this.formatComments(node.trailingComments);
  }
  formatComments(comments) {
    if (!comments) {
      return;
    }
    comments.forEach((com) => {
      if (com.type === NodeType.line_comment) {
        this.formatLineComment(com);
      } else {
        this.formatBlockComment(com);
      }
    });
  }
  formatLineComment(node) {
    if (isMultiline(node.precedingWhitespace || "")) {
      this.layout.add(WS.NEWLINE, WS.INDENT, node.text, WS.MANDATORY_NEWLINE, WS.INDENT);
    } else if (this.layout.getLayoutItems().length > 0) {
      this.layout.add(WS.NO_NEWLINE, WS.SPACE, node.text, WS.MANDATORY_NEWLINE, WS.INDENT);
    } else {
      this.layout.add(node.text, WS.MANDATORY_NEWLINE, WS.INDENT);
    }
  }
  formatBlockComment(node) {
    if (this.isMultilineBlockComment(node)) {
      this.splitBlockComment(node.text).forEach((line) => {
        this.layout.add(WS.NEWLINE, WS.INDENT, line);
      });
      this.layout.add(WS.NEWLINE, WS.INDENT);
    } else {
      this.layout.add(node.text, WS.SPACE);
    }
  }
  isMultilineBlockComment(node) {
    return isMultiline(node.text) || isMultiline(node.precedingWhitespace || "");
  }
  isDocComment(comment) {
    const lines = comment.split(/\n/);
    return (
      // first line starts with /* or /**
      /^\/\*\*?$/.test(lines[0]) && // intermediate lines start with *
      lines.slice(1, lines.length - 1).every((line) => /^\s*\*/.test(line)) && // last line ends with */
      /^\s*\*\/$/.test(last(lines))
    );
  }
  // Breaks up block comment to multiple lines.
  // For example this doc-comment (dots representing leading whitespace):
  //
  //   ..../**
  //   .....* Some description here
  //   .....* and here too
  //   .....*/
  //
  // gets broken to this array (note the leading single spaces):
  //
  //   [ '/**',
  //     '.* Some description here',
  //     '.* and here too',
  //     '.*/' ]
  //
  // However, a normal comment (non-doc-comment) like this:
  //
  //   ..../*
  //   ....Some description here
  //   ....*/
  //
  // gets broken to this array (no leading spaces):
  //
  //   [ '/*',
  //     'Some description here',
  //     '*/' ]
  //
  splitBlockComment(comment) {
    if (this.isDocComment(comment)) {
      return comment.split(/\n/).map((line) => {
        if (/^\s*\*/.test(line)) {
          return " " + line.replace(/^\s*/, "");
        } else {
          return line;
        }
      });
    } else {
      return comment.split(/\n/).map((line) => line.replace(/^\s*/, ""));
    }
  }
  formatSubExpression(nodes) {
    return new ExpressionFormatter({
      cfg: this.cfg,
      dialectCfg: this.dialectCfg,
      params: this.params,
      layout: this.layout,
      inline: this.inline
    }).format(nodes);
  }
  formatInlineExpression(nodes) {
    const oldParamIndex = this.params.getPositionalParameterIndex();
    try {
      return new ExpressionFormatter({
        cfg: this.cfg,
        dialectCfg: this.dialectCfg,
        params: this.params,
        layout: new InlineLayout(this.cfg.expressionWidth),
        inline: true
      }).format(nodes);
    } catch (e) {
      if (e instanceof InlineLayoutError) {
        this.params.setPositionalParameterIndex(oldParamIndex);
        return void 0;
      } else {
        throw e;
      }
    }
  }
  formatKeywordNode(node) {
    switch (node.tokenType) {
      case TokenType.RESERVED_JOIN:
        return this.formatJoin(node);
      case TokenType.AND:
      case TokenType.OR:
      case TokenType.XOR:
        return this.formatLogicalOperator(node);
      default:
        return this.formatKeyword(node);
    }
  }
  formatJoin(node) {
    if (isTabularStyle(this.cfg)) {
      this.layout.indentation.decreaseTopLevel();
      this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node), WS.SPACE);
      this.layout.indentation.increaseTopLevel();
    } else {
      this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node), WS.SPACE);
    }
  }
  formatKeyword(node) {
    this.layout.add(this.showKw(node), WS.SPACE);
  }
  formatLogicalOperator(node) {
    if (this.cfg.logicalOperatorNewline === "before") {
      if (isTabularStyle(this.cfg)) {
        this.layout.indentation.decreaseTopLevel();
        this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node), WS.SPACE);
        this.layout.indentation.increaseTopLevel();
      } else {
        this.layout.add(WS.NEWLINE, WS.INDENT, this.showKw(node), WS.SPACE);
      }
    } else {
      this.layout.add(this.showKw(node), WS.NEWLINE, WS.INDENT);
    }
  }
  showKw(node) {
    if (isTabularToken(node.tokenType)) {
      return toTabularFormat(this.showNonTabularKw(node), this.cfg.indentStyle);
    } else {
      return this.showNonTabularKw(node);
    }
  }
  // Like showKw(), but skips tabular formatting
  showNonTabularKw(node) {
    switch (this.cfg.keywordCase) {
      case "preserve":
        return equalizeWhitespace(node.raw);
      case "upper":
        return node.text;
      case "lower":
        return node.text.toLowerCase();
    }
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/formatter/Formatter.js
var Formatter = class {
  constructor(dialect, cfg) {
    this.dialect = dialect;
    this.cfg = cfg;
    this.params = new Params(this.cfg.params);
  }
  /**
   * Formats an SQL query.
   * @param {string} query - The SQL query string to be formatted
   * @return {string} The formatter query
   */
  format(query) {
    const ast = this.parse(query);
    const formattedQuery = this.formatAst(ast);
    const finalQuery = this.postFormat(formattedQuery);
    return finalQuery.trimEnd();
  }
  parse(query) {
    return createParser(this.dialect.tokenizer).parse(query, this.cfg.paramTypes || {});
  }
  formatAst(statements) {
    return statements.map((stat) => this.formatStatement(stat)).join("\n".repeat(this.cfg.linesBetweenQueries + 1));
  }
  formatStatement(statement) {
    const layout = new ExpressionFormatter({
      cfg: this.cfg,
      dialectCfg: this.dialect.formatOptions,
      params: this.params,
      layout: new Layout(new Indentation(indentString(this.cfg)))
    }).format(statement.children);
    if (!statement.hasSemicolon) {
    } else if (this.cfg.newlineBeforeSemicolon) {
      layout.add(WS.NEWLINE, ";");
    } else {
      layout.add(WS.NO_NEWLINE, ";");
    }
    return layout.toString();
  }
  postFormat(query) {
    if (this.cfg.tabulateAlias) {
      query = formatAliasPositions(query);
    }
    if (this.cfg.commaPosition === "before" || this.cfg.commaPosition === "tabular") {
      query = formatCommaPositions(query, this.cfg.commaPosition, indentString(this.cfg));
    }
    return query;
  }
};

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/validateConfig.js
var ConfigError = class extends Error {
};
function validateConfig(cfg) {
  if ("multilineLists" in cfg) {
    throw new ConfigError("multilineLists config is no more supported.");
  }
  if ("newlineBeforeOpenParen" in cfg) {
    throw new ConfigError("newlineBeforeOpenParen config is no more supported.");
  }
  if ("newlineBeforeCloseParen" in cfg) {
    throw new ConfigError("newlineBeforeCloseParen config is no more supported.");
  }
  if ("aliasAs" in cfg) {
    throw new ConfigError("aliasAs config is no more supported.");
  }
  if (cfg.expressionWidth <= 0) {
    throw new ConfigError(`expressionWidth config must be positive number. Received ${cfg.expressionWidth} instead.`);
  }
  if (cfg.commaPosition === "before" && cfg.useTabs) {
    throw new ConfigError("commaPosition: before does not work when tabs are used for indentation.");
  }
  if (cfg.params && !validateParams(cfg.params)) {
    console.warn('WARNING: All "params" option values should be strings.');
  }
  return cfg;
}
function validateParams(params) {
  const paramValues = params instanceof Array ? params : Object.values(params);
  return paramValues.every((p) => typeof p === "string");
}

// ../../node_modules/.pnpm/sql-formatter@12.2.4/node_modules/sql-formatter/lib/sqlFormatter.js
var dialectNameMap = {
  bigquery: "bigquery",
  db2: "db2",
  hive: "hive",
  mariadb: "mariadb",
  mysql: "mysql",
  n1ql: "n1ql",
  plsql: "plsql",
  postgresql: "postgresql",
  redshift: "redshift",
  spark: "spark",
  sqlite: "sqlite",
  sql: "sql",
  trino: "trino",
  transactsql: "transactsql",
  tsql: "transactsql",
  // alias for transactsq
  singlestoredb: "singlestoredb",
  snowflake: "snowflake"
};
var supportedDialects = Object.keys(dialectNameMap);
var defaultOptions = {
  tabWidth: 2,
  useTabs: false,
  keywordCase: "preserve",
  indentStyle: "standard",
  logicalOperatorNewline: "before",
  tabulateAlias: false,
  commaPosition: "after",
  expressionWidth: 50,
  linesBetweenQueries: 1,
  denseOperators: false,
  newlineBeforeSemicolon: false
};
var format = (query, cfg = {}) => {
  if (typeof cfg.language === "string" && !supportedDialects.includes(cfg.language)) {
    throw new ConfigError(`Unsupported SQL dialect: ${cfg.language}`);
  }
  const canonicalDialectName = dialectNameMap[cfg.language || "sql"];
  return formatDialect(query, {
    ...cfg,
    dialect: allDialects_exports[canonicalDialectName]
  });
};
var formatDialect = (query, {
  dialect,
  ...cfg
}) => {
  if (typeof query !== "string") {
    throw new Error("Invalid query argument. Expected string, instead got " + typeof query);
  }
  const options = validateConfig({
    ...defaultOptions,
    ...cfg
  });
  return new Formatter(createDialect(dialect), options).format(query);
};

// app/routes/query.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id2) => {
    window.$RefreshRuntime$.register(type, '"app/routes/query.tsx"' + id2);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/query.tsx"
  );
  import.meta.hot.lastModified = "1732570786954.9265";
}
function QueryPage() {
  var _a, _b;
  _s();
  const [query, setQuery] = (0, import_react.useState)("");
  const [results, setResults] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [isLoading, setIsLoading] = (0, import_react.useState)(false);
  const handleExecuteQuery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await executeQuery(query);
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  const handleFormat = () => {
    try {
      const formatted = format(query, {
        language: "postgresql"
      });
      setQuery(formatted);
    } catch (err) {
      setError("Error formatting query");
    }
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PageContainer, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex-none px-4 py-3 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: "SQL Query" }, void 0, false, {
      fileName: "app/routes/query.tsx",
      lineNumber: 56,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/query.tsx",
      lineNumber: 55,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex-1 min-h-0 p-4 overflow-y-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex justify-between mb-2", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("label", { htmlFor: "query", className: "block text-sm font-medium text-gray-700 dark:text-gray-300", children: "SQL Query" }, void 0, false, {
            fileName: "app/routes/query.tsx",
            lineNumber: 63,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { onClick: handleFormat, className: "text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300", children: "Format Query" }, void 0, false, {
            fileName: "app/routes/query.tsx",
            lineNumber: 66,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/query.tsx",
          lineNumber: 62,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("textarea", { id: "query", value: query, onChange: (e) => setQuery(e.target.value), rows: 4, className: "w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600", placeholder: "Enter your SQL query here..." }, void 0, false, {
          fileName: "app/routes/query.tsx",
          lineNumber: 70,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/query.tsx",
        lineNumber: 61,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { onClick: handleExecuteQuery, disabled: isLoading || !query.trim(), className: "w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed", children: isLoading ? "Executing..." : "Execute Query" }, void 0, false, {
        fileName: "app/routes/query.tsx",
        lineNumber: 74,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/routes/query.tsx",
        lineNumber: 73,
        columnNumber: 11
      }, this),
      error && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "p-4 bg-red-50 dark:bg-red-900/50 rounded-lg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-sm text-red-700 dark:text-red-300", children: error }, void 0, false, {
        fileName: "app/routes/query.tsx",
        lineNumber: 80,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "app/routes/query.tsx",
        lineNumber: 79,
        columnNumber: 21
      }, this),
      results && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { className: "text-xl font-semibold mb-4", children: "Results" }, void 0, false, {
          fileName: "app/routes/query.tsx",
          lineNumber: 84,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "overflow-x-auto", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("table", { className: "w-full divide-y divide-gray-300 dark:divide-gray-700", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("thead", { className: "bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tr", { children: (_a = results.fields) == null ? void 0 : _a.map((field) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: field.name }, field.name, false, {
            fileName: "app/routes/query.tsx",
            lineNumber: 89,
            columnNumber: 53
          }, this)) }, void 0, false, {
            fileName: "app/routes/query.tsx",
            lineNumber: 88,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "app/routes/query.tsx",
            lineNumber: 87,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800", children: (_b = results.rows) == null ? void 0 : _b.map((row, rowIndex) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tr", { children: Object.values(row).map((value, colIndex) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", children: value === null ? "NULL" : String(value) }, colIndex, false, {
            fileName: "app/routes/query.tsx",
            lineNumber: 96,
            columnNumber: 70
          }, this)) }, rowIndex, false, {
            fileName: "app/routes/query.tsx",
            lineNumber: 95,
            columnNumber: 59
          }, this)) }, void 0, false, {
            fileName: "app/routes/query.tsx",
            lineNumber: 94,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/query.tsx",
          lineNumber: 86,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "app/routes/query.tsx",
          lineNumber: 85,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/query.tsx",
        lineNumber: 83,
        columnNumber: 23
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/query.tsx",
      lineNumber: 60,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/query.tsx",
      lineNumber: 59,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/query.tsx",
    lineNumber: 54,
    columnNumber: 10
  }, this);
}
_s(QueryPage, "y9+hDj05i7Hp7QklbMkA3OyGVhM=");
_c = QueryPage;
var _c;
$RefreshReg$(_c, "QueryPage");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  QueryPage as default
};
//# sourceMappingURL=/build/routes/query-6QIF55U7.js.map
