var K = (i, t) => () => (t || i((t = { exports: {} }).exports, t), t.exports);
var le = K((k) => {
  (function (i) {
    (i.parser = function (n, e) {
      return new u(n, e);
    }),
      (i.SAXParser = u),
      (i.SAXStream = O),
      (i.createStream = Le),
      (i.MAX_BUFFER_LENGTH = 64 * 1024);
    var t = [
      'comment',
      'sgmlDecl',
      'textNode',
      'tagName',
      'doctype',
      'procInstName',
      'procInstBody',
      'entity',
      'attribName',
      'attribValue',
      'cdata',
      'script'
    ];
    i.EVENTS = [
      'text',
      'processinginstruction',
      'sgmldeclaration',
      'doctype',
      'comment',
      'opentagstart',
      'attribute',
      'opentag',
      'closetag',
      'opencdata',
      'cdata',
      'closecdata',
      'error',
      'end',
      'ready',
      'script',
      'opennamespace',
      'closenamespace'
    ];
    function u(n, e) {
      if (!(this instanceof u)) return new u(n, e);
      var c = this;
      l(c),
        (c.q = c.c = ''),
        (c.bufferCheckPosition = i.MAX_BUFFER_LENGTH),
        (c.opt = e || {}),
        (c.opt.lowercase = c.opt.lowercase || c.opt.lowercasetags),
        (c.looseCase = c.opt.lowercase ? 'toLowerCase' : 'toUpperCase'),
        (c.tags = []),
        (c.closed = c.closedRoot = c.sawRoot = !1),
        (c.tag = c.error = null),
        (c.strict = !!n),
        (c.noscript = !!(n || c.opt.noscript)),
        (c.state = r.BEGIN),
        (c.strictEntities = c.opt.strictEntities),
        (c.ENTITIES = c.strictEntities
          ? Object.create(i.XML_ENTITIES)
          : Object.create(i.ENTITIES)),
        (c.attribList = []),
        c.opt.xmlns && (c.ns = Object.create(Ve)),
        (c.trackPosition = c.opt.position !== !1),
        c.trackPosition && (c.position = c.line = c.column = 0),
        L(c, 'onready');
    }
    Object.create ||
      (Object.create = function (n) {
        function e() {}
        e.prototype = n;
        var c = new e();
        return c;
      }),
      Object.keys ||
        (Object.keys = function (n) {
          var e = [];
          for (var c in n) n.hasOwnProperty(c) && e.push(c);
          return e;
        });
    function o(n) {
      for (
        var e = Math.max(i.MAX_BUFFER_LENGTH, 10), c = 0, a = 0, y = t.length;
        a < y;
        a++
      ) {
        var F = n[t[a]].length;
        if (F > e)
          switch (t[a]) {
            case 'textNode':
              U(n);
              break;
            case 'cdata':
              A(n, 'oncdata', n.cdata), (n.cdata = '');
              break;
            case 'script':
              A(n, 'onscript', n.script), (n.script = '');
              break;
            default:
              G(n, 'Max buffer length exceeded: ' + t[a]);
          }
        c = Math.max(c, F);
      }
      var b = i.MAX_BUFFER_LENGTH - c;
      n.bufferCheckPosition = b + n.position;
    }
    function l(n) {
      for (var e = 0, c = t.length; e < c; e++) n[t[e]] = '';
    }
    function E(n) {
      U(n),
        n.cdata !== '' && (A(n, 'oncdata', n.cdata), (n.cdata = '')),
        n.script !== '' && (A(n, 'onscript', n.script), (n.script = ''));
    }
    u.prototype = {
      end: function () {
        re(this);
      },
      write: He,
      resume: function () {
        return (this.error = null), this;
      },
      close: function () {
        return this.write(null);
      },
      flush: function () {
        E(this);
      }
    };
    var m;
    try {
      m = require('stream').Stream;
    } catch {
      m = function () {};
    }
    var N = i.EVENTS.filter(function (n) {
      return n !== 'error' && n !== 'end';
    });
    function Le(n, e) {
      return new O(n, e);
    }
    function O(n, e) {
      if (!(this instanceof O)) return new O(n, e);
      m.apply(this),
        (this._parser = new u(n, e)),
        (this.writable = !0),
        (this.readable = !0);
      var c = this;
      (this._parser.onend = function () {
        c.emit('end');
      }),
        (this._parser.onerror = function (a) {
          c.emit('error', a), (c._parser.error = null);
        }),
        (this._decoder = null),
        N.forEach(function (a) {
          Object.defineProperty(c, 'on' + a, {
            get: function () {
              return c._parser['on' + a];
            },
            set: function (y) {
              if (!y)
                return c.removeAllListeners(a), (c._parser['on' + a] = y), y;
              c.on(a, y);
            },
            enumerable: !0,
            configurable: !1
          });
        });
    }
    (O.prototype = Object.create(m.prototype, { constructor: { value: O } })),
      (O.prototype.write = function (n) {
        if (
          typeof Buffer == 'function' &&
          typeof Buffer.isBuffer == 'function' &&
          Buffer.isBuffer(n)
        ) {
          if (!this._decoder) {
            var e = require('string_decoder').StringDecoder;
            this._decoder = new e('utf8');
          }
          n = this._decoder.write(n);
        }
        return this._parser.write(n.toString()), this.emit('data', n), !0;
      }),
      (O.prototype.end = function (n) {
        return n && n.length && this.write(n), this._parser.end(), !0;
      }),
      (O.prototype.on = function (n, e) {
        var c = this;
        return (
          !c._parser['on' + n] &&
            N.indexOf(n) !== -1 &&
            (c._parser['on' + n] = function () {
              var a =
                arguments.length === 1
                  ? [arguments[0]]
                  : Array.apply(null, arguments);
              a.splice(0, 0, n), c.emit.apply(c, a);
            }),
          m.prototype.on.call(c, n, e)
        );
      });
    var Ue = '[CDATA[',
      Me = 'DOCTYPE',
      X = 'http://www.w3.org/XML/1998/namespace',
      H = 'http://www.w3.org/2000/xmlns/',
      Ve = { xml: X, xmlns: H },
      p =
        /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,
      Q =
        /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/,
      Ge =
        /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,
      ke =
        /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function x(n) {
      return (
        n === ' ' ||
        n ===
          `
        ` ||
        n === '\r' ||
        n === '	'
      );
    }
    function V(n) {
      return n === '"' || n === "'";
    }
    function je(n) {
      return n === '>' || x(n);
    }
    function w(n, e) {
      return n.test(e);
    }
    function qe(n, e) {
      return !w(n, e);
    }
    var r = 0;
    (i.STATE = {
      BEGIN: r++,
      BEGIN_WHITESPACE: r++,
      TEXT: r++,
      TEXT_ENTITY: r++,
      OPEN_WAKA: r++,
      SGML_DECL: r++,
      SGML_DECL_QUOTED: r++,
      DOCTYPE: r++,
      DOCTYPE_QUOTED: r++,
      DOCTYPE_DTD: r++,
      DOCTYPE_DTD_QUOTED: r++,
      COMMENT_STARTING: r++,
      COMMENT: r++,
      COMMENT_ENDING: r++,
      COMMENT_ENDED: r++,
      CDATA: r++,
      CDATA_ENDING: r++,
      CDATA_ENDING_2: r++,
      PROC_INST: r++,
      PROC_INST_BODY: r++,
      PROC_INST_ENDING: r++,
      OPEN_TAG: r++,
      OPEN_TAG_SLASH: r++,
      ATTRIB: r++,
      ATTRIB_NAME: r++,
      ATTRIB_NAME_SAW_WHITE: r++,
      ATTRIB_VALUE: r++,
      ATTRIB_VALUE_QUOTED: r++,
      ATTRIB_VALUE_CLOSED: r++,
      ATTRIB_VALUE_UNQUOTED: r++,
      ATTRIB_VALUE_ENTITY_Q: r++,
      ATTRIB_VALUE_ENTITY_U: r++,
      CLOSE_TAG: r++,
      CLOSE_TAG_SAW_WHITE: r++,
      SCRIPT: r++,
      SCRIPT_ENDING: r++
    }),
      (i.XML_ENTITIES = { amp: '&', gt: '>', lt: '<', quot: '"', apos: "'" }),
      (i.ENTITIES = {
        amp: '&',
        gt: '>',
        lt: '<',
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
      }),
      Object.keys(i.ENTITIES).forEach(function (n) {
        var e = i.ENTITIES[n],
          c = typeof e == 'number' ? String.fromCharCode(e) : e;
        i.ENTITIES[n] = c;
      });
    for (var ie in i.STATE) i.STATE[i.STATE[ie]] = ie;
    r = i.STATE;
    function L(n, e, c) {
      n[e] && n[e](c);
    }
    function A(n, e, c) {
      n.textNode && U(n), L(n, e, c);
    }
    function U(n) {
      (n.textNode = ae(n.opt, n.textNode)),
        n.textNode && L(n, 'ontext', n.textNode),
        (n.textNode = '');
    }
    function ae(n, e) {
      return (
        n.trim && (e = e.trim()), n.normalize && (e = e.replace(/\s+/g, ' ')), e
      );
    }
    function G(n, e) {
      return (
        U(n),
        n.trackPosition &&
          (e +=
            `
        Line: ` +
            n.line +
            `
        Column: ` +
            n.column +
            `
        Char: ` +
            n.c),
        (e = new Error(e)),
        (n.error = e),
        L(n, 'onerror', e),
        n
      );
    }
    function re(n) {
      return (
        n.sawRoot && !n.closedRoot && d(n, 'Unclosed root tag'),
        n.state !== r.BEGIN &&
          n.state !== r.BEGIN_WHITESPACE &&
          n.state !== r.TEXT &&
          G(n, 'Unexpected end'),
        U(n),
        (n.c = ''),
        (n.closed = !0),
        L(n, 'onend'),
        u.call(n, n.strict, n.opt),
        n
      );
    }
    function d(n, e) {
      if (typeof n != 'object' || !(n instanceof u))
        throw new Error('bad call to strictFail');
      n.strict && G(n, e);
    }
    function Ye(n) {
      n.strict || (n.tagName = n.tagName[n.looseCase]());
      var e = n.tags[n.tags.length - 1] || n,
        c = (n.tag = { name: n.tagName, attributes: {} });
      n.opt.xmlns && (c.ns = e.ns),
        (n.attribList.length = 0),
        A(n, 'onopentagstart', c);
    }
    function W(n, e) {
      var c = n.indexOf(':'),
        a = c < 0 ? ['', n] : n.split(':'),
        y = a[0],
        F = a[1];
      return (
        e && n === 'xmlns' && ((y = 'xmlns'), (F = '')), { prefix: y, local: F }
      );
    }
    function z(n) {
      if (
        (n.strict || (n.attribName = n.attribName[n.looseCase]()),
        n.attribList.indexOf(n.attribName) !== -1 ||
          n.tag.attributes.hasOwnProperty(n.attribName))
      ) {
        n.attribName = n.attribValue = '';
        return;
      }
      if (n.opt.xmlns) {
        var e = W(n.attribName, !0),
          c = e.prefix,
          a = e.local;
        if (c === 'xmlns')
          if (a === 'xml' && n.attribValue !== X)
            d(
              n,
              'xml: prefix must be bound to ' +
                X +
                `
          Actual: ` +
                n.attribValue
            );
          else if (a === 'xmlns' && n.attribValue !== H)
            d(
              n,
              'xmlns: prefix must be bound to ' +
                H +
                `
          Actual: ` +
                n.attribValue
            );
          else {
            var y = n.tag,
              F = n.tags[n.tags.length - 1] || n;
            y.ns === F.ns && (y.ns = Object.create(F.ns)),
              (y.ns[a] = n.attribValue);
          }
        n.attribList.push([n.attribName, n.attribValue]);
      } else
        (n.tag.attributes[n.attribName] = n.attribValue),
          A(n, 'onattribute', { name: n.attribName, value: n.attribValue });
      n.attribName = n.attribValue = '';
    }
    function P(n, e) {
      if (n.opt.xmlns) {
        var c = n.tag,
          a = W(n.tagName);
        (c.prefix = a.prefix),
          (c.local = a.local),
          (c.uri = c.ns[a.prefix] || ''),
          c.prefix &&
            !c.uri &&
            (d(n, 'Unbound namespace prefix: ' + JSON.stringify(n.tagName)),
            (c.uri = a.prefix));
        var y = n.tags[n.tags.length - 1] || n;
        c.ns &&
          y.ns !== c.ns &&
          Object.keys(c.ns).forEach(function (oe) {
            A(n, 'onopennamespace', { prefix: oe, uri: c.ns[oe] });
          });
        for (var F = 0, b = n.attribList.length; F < b; F++) {
          var D = n.attribList[F],
            C = D[0],
            R = D[1],
            _ = W(C, !0),
            S = _.prefix,
            Qe = _.local,
            ce = S === '' ? '' : c.ns[S] || '',
            Z = { name: C, value: R, prefix: S, local: Qe, uri: ce };
          S &&
            S !== 'xmlns' &&
            !ce &&
            (d(n, 'Unbound namespace prefix: ' + JSON.stringify(S)),
            (Z.uri = S)),
            (n.tag.attributes[C] = Z),
            A(n, 'onattribute', Z);
        }
        n.attribList.length = 0;
      }
      (n.tag.isSelfClosing = !!e),
        (n.sawRoot = !0),
        n.tags.push(n.tag),
        A(n, 'onopentag', n.tag),
        e ||
          (!n.noscript && n.tagName.toLowerCase() === 'script'
            ? (n.state = r.SCRIPT)
            : (n.state = r.TEXT),
          (n.tag = null),
          (n.tagName = '')),
        (n.attribName = n.attribValue = ''),
        (n.attribList.length = 0);
    }
    function J(n) {
      if (!n.tagName) {
        d(n, 'Weird empty close tag.'),
          (n.textNode += '</>'),
          (n.state = r.TEXT);
        return;
      }
      if (n.script) {
        if (n.tagName !== 'script') {
          (n.script += '</' + n.tagName + '>'),
            (n.tagName = ''),
            (n.state = r.SCRIPT);
          return;
        }
        A(n, 'onscript', n.script), (n.script = '');
      }
      var e = n.tags.length,
        c = n.tagName;
      n.strict || (c = c[n.looseCase]());
      for (var a = c; e--; ) {
        var y = n.tags[e];
        if (y.name !== a) d(n, 'Unexpected close tag');
        else break;
      }
      if (e < 0) {
        d(n, 'Unmatched closing tag: ' + n.tagName),
          (n.textNode += '</' + n.tagName + '>'),
          (n.state = r.TEXT);
        return;
      }
      n.tagName = c;
      for (var F = n.tags.length; F-- > e; ) {
        var b = (n.tag = n.tags.pop());
        (n.tagName = n.tag.name), A(n, 'onclosetag', n.tagName);
        var D = {};
        for (var C in b.ns) D[C] = b.ns[C];
        var R = n.tags[n.tags.length - 1] || n;
        n.opt.xmlns &&
          b.ns !== R.ns &&
          Object.keys(b.ns).forEach(function (_) {
            var S = b.ns[_];
            A(n, 'onclosenamespace', { prefix: _, uri: S });
          });
      }
      e === 0 && (n.closedRoot = !0),
        (n.tagName = n.attribValue = n.attribName = ''),
        (n.attribList.length = 0),
        (n.state = r.TEXT);
    }
    function Xe(n) {
      var e = n.entity,
        c = e.toLowerCase(),
        a,
        y = '';
      return n.ENTITIES[e]
        ? n.ENTITIES[e]
        : n.ENTITIES[c]
          ? n.ENTITIES[c]
          : ((e = c),
            e.charAt(0) === '#' &&
              (e.charAt(1) === 'x'
                ? ((e = e.slice(2)),
                  (a = parseInt(e, 16)),
                  (y = a.toString(16)))
                : ((e = e.slice(1)),
                  (a = parseInt(e, 10)),
                  (y = a.toString(10)))),
            (e = e.replace(/^0+/, '')),
            isNaN(a) || y.toLowerCase() !== e
              ? (d(n, 'Invalid character entity'), '&' + n.entity + ';')
              : String.fromCodePoint(a));
    }
    function se(n, e) {
      e === '<'
        ? ((n.state = r.OPEN_WAKA), (n.startTagPosition = n.position))
        : x(e) ||
          (d(n, 'Non-whitespace before first tag.'),
          (n.textNode = e),
          (n.state = r.TEXT));
    }
    function ue(n, e) {
      var c = '';
      return e < n.length && (c = n.charAt(e)), c;
    }
    function He(n) {
      var e = this;
      if (this.error) throw this.error;
      if (e.closed)
        return G(e, 'Cannot write after close. Assign an onready handler.');
      if (n === null) return re(e);
      typeof n == 'object' && (n = n.toString());
      for (var c = 0, a = ''; (a = ue(n, c++)), (e.c = a), !!a; )
        switch (
          (e.trackPosition &&
            (e.position++,
            a ===
            `
`
              ? (e.line++, (e.column = 0))
              : e.column++),
          e.state)
        ) {
          case r.BEGIN:
            if (((e.state = r.BEGIN_WHITESPACE), a === '\uFEFF')) continue;
            se(e, a);
            continue;
          case r.BEGIN_WHITESPACE:
            se(e, a);
            continue;
          case r.TEXT:
            if (e.sawRoot && !e.closedRoot) {
              for (var y = c - 1; a && a !== '<' && a !== '&'; )
                (a = ue(n, c++)),
                  a &&
                    e.trackPosition &&
                    (e.position++,
                    a ===
                    `
`
                      ? (e.line++, (e.column = 0))
                      : e.column++);
              e.textNode += n.substring(y, c - 1);
            }
            a === '<' && !(e.sawRoot && e.closedRoot && !e.strict)
              ? ((e.state = r.OPEN_WAKA), (e.startTagPosition = e.position))
              : (!x(a) &&
                  (!e.sawRoot || e.closedRoot) &&
                  d(e, 'Text data outside of root node.'),
                a === '&' ? (e.state = r.TEXT_ENTITY) : (e.textNode += a));
            continue;
          case r.SCRIPT:
            a === '<' ? (e.state = r.SCRIPT_ENDING) : (e.script += a);
            continue;
          case r.SCRIPT_ENDING:
            a === '/'
              ? (e.state = r.CLOSE_TAG)
              : ((e.script += '<' + a), (e.state = r.SCRIPT));
            continue;
          case r.OPEN_WAKA:
            if (a === '!') (e.state = r.SGML_DECL), (e.sgmlDecl = '');
            else if (!x(a))
              if (w(p, a)) (e.state = r.OPEN_TAG), (e.tagName = a);
              else if (a === '/') (e.state = r.CLOSE_TAG), (e.tagName = '');
              else if (a === '?')
                (e.state = r.PROC_INST), (e.procInstName = e.procInstBody = '');
              else {
                if (
                  (d(e, 'Unencoded <'), e.startTagPosition + 1 < e.position)
                ) {
                  var F = e.position - e.startTagPosition;
                  a = new Array(F).join(' ') + a;
                }
                (e.textNode += '<' + a), (e.state = r.TEXT);
              }
            continue;
          case r.SGML_DECL:
            (e.sgmlDecl + a).toUpperCase() === Ue
              ? (A(e, 'onopencdata'),
                (e.state = r.CDATA),
                (e.sgmlDecl = ''),
                (e.cdata = ''))
              : e.sgmlDecl + a === '--'
                ? ((e.state = r.COMMENT), (e.comment = ''), (e.sgmlDecl = ''))
                : (e.sgmlDecl + a).toUpperCase() === Me
                  ? ((e.state = r.DOCTYPE),
                    (e.doctype || e.sawRoot) &&
                      d(e, 'Inappropriately located doctype declaration'),
                    (e.doctype = ''),
                    (e.sgmlDecl = ''))
                  : a === '>'
                    ? (A(e, 'onsgmldeclaration', e.sgmlDecl),
                      (e.sgmlDecl = ''),
                      (e.state = r.TEXT))
                    : (V(a) && (e.state = r.SGML_DECL_QUOTED),
                      (e.sgmlDecl += a));
            continue;
          case r.SGML_DECL_QUOTED:
            a === e.q && ((e.state = r.SGML_DECL), (e.q = '')),
              (e.sgmlDecl += a);
            continue;
          case r.DOCTYPE:
            a === '>'
              ? ((e.state = r.TEXT),
                A(e, 'ondoctype', e.doctype),
                (e.doctype = !0))
              : ((e.doctype += a),
                a === '['
                  ? (e.state = r.DOCTYPE_DTD)
                  : V(a) && ((e.state = r.DOCTYPE_QUOTED), (e.q = a)));
            continue;
          case r.DOCTYPE_QUOTED:
            (e.doctype += a), a === e.q && ((e.q = ''), (e.state = r.DOCTYPE));
            continue;
          case r.DOCTYPE_DTD:
            (e.doctype += a),
              a === ']'
                ? (e.state = r.DOCTYPE)
                : V(a) && ((e.state = r.DOCTYPE_DTD_QUOTED), (e.q = a));
            continue;
          case r.DOCTYPE_DTD_QUOTED:
            (e.doctype += a),
              a === e.q && ((e.state = r.DOCTYPE_DTD), (e.q = ''));
            continue;
          case r.COMMENT:
            a === '-' ? (e.state = r.COMMENT_ENDING) : (e.comment += a);
            continue;
          case r.COMMENT_ENDING:
            a === '-'
              ? ((e.state = r.COMMENT_ENDED),
                (e.comment = ae(e.opt, e.comment)),
                e.comment && A(e, 'oncomment', e.comment),
                (e.comment = ''))
              : ((e.comment += '-' + a), (e.state = r.COMMENT));
            continue;
          case r.COMMENT_ENDED:
            a !== '>'
              ? (d(e, 'Malformed comment'),
                (e.comment += '--' + a),
                (e.state = r.COMMENT))
              : (e.state = r.TEXT);
            continue;
          case r.CDATA:
            a === ']' ? (e.state = r.CDATA_ENDING) : (e.cdata += a);
            continue;
          case r.CDATA_ENDING:
            a === ']'
              ? (e.state = r.CDATA_ENDING_2)
              : ((e.cdata += ']' + a), (e.state = r.CDATA));
            continue;
          case r.CDATA_ENDING_2:
            a === '>'
              ? (e.cdata && A(e, 'oncdata', e.cdata),
                A(e, 'onclosecdata'),
                (e.cdata = ''),
                (e.state = r.TEXT))
              : a === ']'
                ? (e.cdata += ']')
                : ((e.cdata += ']]' + a), (e.state = r.CDATA));
            continue;
          case r.PROC_INST:
            a === '?'
              ? (e.state = r.PROC_INST_ENDING)
              : x(a)
                ? (e.state = r.PROC_INST_BODY)
                : (e.procInstName += a);
            continue;
          case r.PROC_INST_BODY:
            if (!e.procInstBody && x(a)) continue;
            a === '?' ? (e.state = r.PROC_INST_ENDING) : (e.procInstBody += a);
            continue;
          case r.PROC_INST_ENDING:
            a === '>'
              ? (A(e, 'onprocessinginstruction', {
                  name: e.procInstName,
                  body: e.procInstBody
                }),
                (e.procInstName = e.procInstBody = ''),
                (e.state = r.TEXT))
              : ((e.procInstBody += '?' + a), (e.state = r.PROC_INST_BODY));
            continue;
          case r.OPEN_TAG:
            w(Q, a)
              ? (e.tagName += a)
              : (Ye(e),
                a === '>'
                  ? P(e)
                  : a === '/'
                    ? (e.state = r.OPEN_TAG_SLASH)
                    : (x(a) || d(e, 'Invalid character in tag name'),
                      (e.state = r.ATTRIB)));
            continue;
          case r.OPEN_TAG_SLASH:
            a === '>'
              ? (P(e, !0), J(e))
              : (d(e, 'Forward-slash in opening tag not followed by >'),
                (e.state = r.ATTRIB));
            continue;
          case r.ATTRIB:
            if (x(a)) continue;
            a === '>'
              ? P(e)
              : a === '/'
                ? (e.state = r.OPEN_TAG_SLASH)
                : w(p, a)
                  ? ((e.attribName = a),
                    (e.attribValue = ''),
                    (e.state = r.ATTRIB_NAME))
                  : d(e, 'Invalid attribute name');
            continue;
          case r.ATTRIB_NAME:
            a === '='
              ? (e.state = r.ATTRIB_VALUE)
              : a === '>'
                ? (d(e, 'Attribute without value'),
                  (e.attribValue = e.attribName),
                  z(e),
                  P(e))
                : x(a)
                  ? (e.state = r.ATTRIB_NAME_SAW_WHITE)
                  : w(Q, a)
                    ? (e.attribName += a)
                    : d(e, 'Invalid attribute name');
            continue;
          case r.ATTRIB_NAME_SAW_WHITE:
            if (a === '=') e.state = r.ATTRIB_VALUE;
            else {
              if (x(a)) continue;
              d(e, 'Attribute without value'),
                (e.tag.attributes[e.attribName] = ''),
                (e.attribValue = ''),
                A(e, 'onattribute', { name: e.attribName, value: '' }),
                (e.attribName = ''),
                a === '>'
                  ? P(e)
                  : w(p, a)
                    ? ((e.attribName = a), (e.state = r.ATTRIB_NAME))
                    : (d(e, 'Invalid attribute name'), (e.state = r.ATTRIB));
            }
            continue;
          case r.ATTRIB_VALUE:
            if (x(a)) continue;
            V(a)
              ? ((e.q = a), (e.state = r.ATTRIB_VALUE_QUOTED))
              : (d(e, 'Unquoted attribute value'),
                (e.state = r.ATTRIB_VALUE_UNQUOTED),
                (e.attribValue = a));
            continue;
          case r.ATTRIB_VALUE_QUOTED:
            if (a !== e.q) {
              a === '&'
                ? (e.state = r.ATTRIB_VALUE_ENTITY_Q)
                : (e.attribValue += a);
              continue;
            }
            z(e), (e.q = ''), (e.state = r.ATTRIB_VALUE_CLOSED);
            continue;
          case r.ATTRIB_VALUE_CLOSED:
            x(a)
              ? (e.state = r.ATTRIB)
              : a === '>'
                ? P(e)
                : a === '/'
                  ? (e.state = r.OPEN_TAG_SLASH)
                  : w(p, a)
                    ? (d(e, 'No whitespace between attributes'),
                      (e.attribName = a),
                      (e.attribValue = ''),
                      (e.state = r.ATTRIB_NAME))
                    : d(e, 'Invalid attribute name');
            continue;
          case r.ATTRIB_VALUE_UNQUOTED:
            if (!je(a)) {
              a === '&'
                ? (e.state = r.ATTRIB_VALUE_ENTITY_U)
                : (e.attribValue += a);
              continue;
            }
            z(e), a === '>' ? P(e) : (e.state = r.ATTRIB);
            continue;
          case r.CLOSE_TAG:
            if (e.tagName)
              a === '>'
                ? J(e)
                : w(Q, a)
                  ? (e.tagName += a)
                  : e.script
                    ? ((e.script += '</' + e.tagName),
                      (e.tagName = ''),
                      (e.state = r.SCRIPT))
                    : (x(a) || d(e, 'Invalid tagname in closing tag'),
                      (e.state = r.CLOSE_TAG_SAW_WHITE));
            else {
              if (x(a)) continue;
              qe(p, a)
                ? e.script
                  ? ((e.script += '</' + a), (e.state = r.SCRIPT))
                  : d(e, 'Invalid tagname in closing tag.')
                : (e.tagName = a);
            }
            continue;
          case r.CLOSE_TAG_SAW_WHITE:
            if (x(a)) continue;
            a === '>' ? J(e) : d(e, 'Invalid characters in closing tag');
            continue;
          case r.TEXT_ENTITY:
          case r.ATTRIB_VALUE_ENTITY_Q:
          case r.ATTRIB_VALUE_ENTITY_U:
            var b, D;
            switch (e.state) {
              case r.TEXT_ENTITY:
                (b = r.TEXT), (D = 'textNode');
                break;
              case r.ATTRIB_VALUE_ENTITY_Q:
                (b = r.ATTRIB_VALUE_QUOTED), (D = 'attribValue');
                break;
              case r.ATTRIB_VALUE_ENTITY_U:
                (b = r.ATTRIB_VALUE_UNQUOTED), (D = 'attribValue');
                break;
            }
            a === ';'
              ? ((e[D] += Xe(e)), (e.entity = ''), (e.state = b))
              : w(e.entity.length ? ke : Ge, a)
                ? (e.entity += a)
                : (d(e, 'Invalid character in entity name'),
                  (e[D] += '&' + e.entity + a),
                  (e.entity = ''),
                  (e.state = b));
            continue;
          default:
            throw new Error(e, 'Unknown state: ' + e.state);
        }
      return e.position >= e.bufferCheckPosition && o(e), e;
    }
    String.fromCodePoint ||
      (function () {
        var n = String.fromCharCode,
          e = Math.floor,
          c = function () {
            var a = 16384,
              y = [],
              F,
              b,
              D = -1,
              C = arguments.length;
            if (!C) return '';
            for (var R = ''; ++D < C; ) {
              var _ = Number(arguments[D]);
              if (!isFinite(_) || _ < 0 || _ > 1114111 || e(_) !== _)
                throw RangeError('Invalid code point: ' + _);
              _ <= 65535
                ? y.push(_)
                : ((_ -= 65536),
                  (F = (_ >> 10) + 55296),
                  (b = (_ % 1024) + 56320),
                  y.push(F, b)),
                (D + 1 === C || y.length > a) &&
                  ((R += n.apply(null, y)), (y.length = 0));
            }
            return R;
          };
        Object.defineProperty
          ? Object.defineProperty(String, 'fromCodePoint', {
              value: c,
              configurable: !0,
              writable: !0
            })
          : (String.fromCodePoint = c);
      })();
  })(typeof k > 'u' ? (k.sax = {}) : k);
});
var j = K((yt, fe) => {
  fe.exports = {
    isArray: function (i) {
      return Array.isArray
        ? Array.isArray(i)
        : Object.prototype.toString.call(i) === '[object Array]';
    }
  };
});
var q = K((dt, Ee) => {
  var We = j().isArray;
  Ee.exports = {
    copyOptions: function (i) {
      var t,
        u = {};
      for (t in i) i.hasOwnProperty(t) && (u[t] = i[t]);
      return u;
    },
    ensureFlagExists: function (i, t) {
      (!(i in t) || typeof t[i] != 'boolean') && (t[i] = !1);
    },
    ensureSpacesExists: function (i) {
      (!('spaces' in i) ||
        (typeof i.spaces != 'number' && typeof i.spaces != 'string')) &&
        (i.spaces = 0);
    },
    ensureAlwaysArrayExists: function (i) {
      (!('alwaysArray' in i) ||
        (typeof i.alwaysArray != 'boolean' && !We(i.alwaysArray))) &&
        (i.alwaysArray = !1);
    },
    ensureKeyExists: function (i, t) {
      (!(i + 'Key' in t) || typeof t[i + 'Key'] != 'string') &&
        (t[i + 'Key'] = t.compact ? '_' + i : i);
    },
    checkFnExists: function (i, t) {
      return i + 'Fn' in t;
    }
  };
});
var ee = K((Nt, Fe) => {
  var ze = le(),
    Je = { on: function () {}, parse: function () {} },
    T = q(),
    B = j().isArray,
    s,
    $ = !0,
    f;
  function Ze(i) {
    return (
      (s = T.copyOptions(i)),
      T.ensureFlagExists('ignoreDeclaration', s),
      T.ensureFlagExists('ignoreInstruction', s),
      T.ensureFlagExists('ignoreAttributes', s),
      T.ensureFlagExists('ignoreText', s),
      T.ensureFlagExists('ignoreComment', s),
      T.ensureFlagExists('ignoreCdata', s),
      T.ensureFlagExists('ignoreDoctype', s),
      T.ensureFlagExists('compact', s),
      T.ensureFlagExists('alwaysChildren', s),
      T.ensureFlagExists('addParent', s),
      T.ensureFlagExists('trim', s),
      T.ensureFlagExists('nativeType', s),
      T.ensureFlagExists('nativeTypeAttributes', s),
      T.ensureFlagExists('sanitize', s),
      T.ensureFlagExists('instructionHasAttributes', s),
      T.ensureFlagExists('captureSpacesBetweenElements', s),
      T.ensureAlwaysArrayExists(s),
      T.ensureKeyExists('declaration', s),
      T.ensureKeyExists('instruction', s),
      T.ensureKeyExists('attributes', s),
      T.ensureKeyExists('text', s),
      T.ensureKeyExists('comment', s),
      T.ensureKeyExists('cdata', s),
      T.ensureKeyExists('doctype', s),
      T.ensureKeyExists('type', s),
      T.ensureKeyExists('name', s),
      T.ensureKeyExists('elements', s),
      T.ensureKeyExists('parent', s),
      T.checkFnExists('doctype', s),
      T.checkFnExists('instruction', s),
      T.checkFnExists('cdata', s),
      T.checkFnExists('comment', s),
      T.checkFnExists('text', s),
      T.checkFnExists('instructionName', s),
      T.checkFnExists('elementName', s),
      T.checkFnExists('attributeName', s),
      T.checkFnExists('attributeValue', s),
      T.checkFnExists('attributes', s),
      s
    );
  }
  function Ne(i) {
    var t = Number(i);
    if (!isNaN(t)) return t;
    var u = i.toLowerCase();
    return u === 'true' ? !0 : u === 'false' ? !1 : i;
  }
  function M(i, t) {
    var u;
    if (s.compact) {
      if (
        (!f[s[i + 'Key']] &&
          (B(s.alwaysArray)
            ? s.alwaysArray.indexOf(s[i + 'Key']) !== -1
            : s.alwaysArray) &&
          (f[s[i + 'Key']] = []),
        f[s[i + 'Key']] &&
          !B(f[s[i + 'Key']]) &&
          (f[s[i + 'Key']] = [f[s[i + 'Key']]]),
        i + 'Fn' in s && typeof t == 'string' && (t = s[i + 'Fn'](t, f)),
        i === 'instruction' &&
          ('instructionFn' in s || 'instructionNameFn' in s))
      ) {
        for (u in t)
          if (t.hasOwnProperty(u))
            if ('instructionFn' in s) t[u] = s.instructionFn(t[u], u, f);
            else {
              var o = t[u];
              delete t[u], (t[s.instructionNameFn(u, o, f)] = o);
            }
      }
      B(f[s[i + 'Key']]) ? f[s[i + 'Key']].push(t) : (f[s[i + 'Key']] = t);
    } else {
      f[s.elementsKey] || (f[s.elementsKey] = []);
      var l = {};
      if (((l[s.typeKey] = i), i === 'instruction')) {
        for (u in t) if (t.hasOwnProperty(u)) break;
        (l[s.nameKey] =
          'instructionNameFn' in s ? s.instructionNameFn(u, t, f) : u),
          s.instructionHasAttributes
            ? ((l[s.attributesKey] = t[u][s.attributesKey]),
              'instructionFn' in s &&
                (l[s.attributesKey] = s.instructionFn(
                  l[s.attributesKey],
                  u,
                  f
                )))
            : ('instructionFn' in s && (t[u] = s.instructionFn(t[u], u, f)),
              (l[s.instructionKey] = t[u]));
      } else i + 'Fn' in s && (t = s[i + 'Fn'](t, f)), (l[s[i + 'Key']] = t);
      s.addParent && (l[s.parentKey] = f), f[s.elementsKey].push(l);
    }
  }
  function Ae(i) {
    if (
      ('attributesFn' in s && i && (i = s.attributesFn(i, f)),
      (s.trim ||
        'attributeValueFn' in s ||
        'attributeNameFn' in s ||
        s.nativeTypeAttributes) &&
        i)
    ) {
      var t;
      for (t in i)
        if (
          i.hasOwnProperty(t) &&
          (s.trim && (i[t] = i[t].trim()),
          s.nativeTypeAttributes && (i[t] = Ne(i[t])),
          'attributeValueFn' in s && (i[t] = s.attributeValueFn(i[t], t, f)),
          'attributeNameFn' in s)
        ) {
          var u = i[t];
          delete i[t], (i[s.attributeNameFn(t, i[t], f)] = u);
        }
    }
    return i;
  }
  function $e(i) {
    var t = {};
    if (
      i.body &&
      (i.name.toLowerCase() === 'xml' || s.instructionHasAttributes)
    ) {
      for (
        var u = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))\s*/g, o;
        (o = u.exec(i.body)) !== null;

      )
        t[o[1]] = o[2] || o[3] || o[4];
      t = Ae(t);
    }
    if (i.name.toLowerCase() === 'xml') {
      if (s.ignoreDeclaration) return;
      (f[s.declarationKey] = {}),
        Object.keys(t).length && (f[s.declarationKey][s.attributesKey] = t),
        s.addParent && (f[s.declarationKey][s.parentKey] = f);
    } else {
      if (s.ignoreInstruction) return;
      s.trim && (i.body = i.body.trim());
      var l = {};
      s.instructionHasAttributes && Object.keys(t).length
        ? ((l[i.name] = {}), (l[i.name][s.attributesKey] = t))
        : (l[i.name] = i.body),
        M('instruction', l);
    }
  }
  function me(i, t) {
    var u;
    if (
      (typeof i == 'object' && ((t = i.attributes), (i = i.name)),
      (t = Ae(t)),
      'elementNameFn' in s && (i = s.elementNameFn(i, f)),
      s.compact)
    ) {
      if (((u = {}), !s.ignoreAttributes && t && Object.keys(t).length)) {
        u[s.attributesKey] = {};
        var o;
        for (o in t) t.hasOwnProperty(o) && (u[s.attributesKey][o] = t[o]);
      }
      !(i in f) &&
        (B(s.alwaysArray) ? s.alwaysArray.indexOf(i) !== -1 : s.alwaysArray) &&
        (f[i] = []),
        f[i] && !B(f[i]) && (f[i] = [f[i]]),
        B(f[i]) ? f[i].push(u) : (f[i] = u);
    } else
      f[s.elementsKey] || (f[s.elementsKey] = []),
        (u = {}),
        (u[s.typeKey] = 'element'),
        (u[s.nameKey] = i),
        !s.ignoreAttributes &&
          t &&
          Object.keys(t).length &&
          (u[s.attributesKey] = t),
        s.alwaysChildren && (u[s.elementsKey] = []),
        f[s.elementsKey].push(u);
    (u[s.parentKey] = f), (f = u);
  }
  function Te(i) {
    s.ignoreText ||
      (!i.trim() && !s.captureSpacesBetweenElements) ||
      (s.trim && (i = i.trim()),
      s.nativeType && (i = Ne(i)),
      s.sanitize &&
        (i = i
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')),
      M('text', i));
  }
  function ge(i) {
    s.ignoreComment || (s.trim && (i = i.trim()), M('comment', i));
  }
  function ye(i) {
    var t = f[s.parentKey];
    s.addParent || delete f[s.parentKey], (f = t);
  }
  function et(i) {
    s.ignoreCdata || (s.trim && (i = i.trim()), M('cdata', i));
  }
  function tt(i) {
    s.ignoreDoctype ||
      ((i = i.replace(/^ /, '')), s.trim && (i = i.trim()), M('doctype', i));
  }
  function de(i) {
    i.note = i;
  }
  Fe.exports = function (i, t) {
    var u = $ ? ze.parser(!0, {}) : (u = new Je.Parser('UTF-8')),
      o = {};
    if (
      ((f = o),
      (s = Ze(t)),
      $
        ? ((u.opt = { strictEntities: !0 }),
          (u.onopentag = me),
          (u.ontext = Te),
          (u.oncomment = ge),
          (u.onclosetag = ye),
          (u.onerror = de),
          (u.oncdata = et),
          (u.ondoctype = tt),
          (u.onprocessinginstruction = $e))
        : (u.on('startElement', me),
          u.on('text', Te),
          u.on('comment', ge),
          u.on('endElement', ye),
          u.on('error', de)),
      $)
    )
      u.write(i).close();
    else if (!u.parse(i)) throw new Error('XML parsing error: ' + u.getError());
    if (o[s.elementsKey]) {
      var l = o[s.elementsKey];
      delete o[s.elementsKey], (o[s.elementsKey] = l), delete o.text;
    }
    return o;
  };
});
var he = K((At, _e) => {
  var be = q(),
    nt = ee();
  function it(i) {
    var t = be.copyOptions(i);
    return be.ensureSpacesExists(t), t;
  }
  _e.exports = function (i, t) {
    var u, o, l, E;
    return (
      (u = it(t)),
      (o = nt(i, u)),
      (E = 'compact' in u && u.compact ? '_parent' : 'parent'),
      'addParent' in u && u.addParent
        ? (l = JSON.stringify(
            o,
            function (m, N) {
              return m === E ? '_' : N;
            },
            u.spaces
          ))
        : (l = JSON.stringify(o, null, u.spaces)),
      l.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
    );
  };
});
var ne = K((Ft, Ke) => {
  var g = q(),
    at = j().isArray,
    h,
    I;
  function rt(i) {
    var t = g.copyOptions(i);
    return (
      g.ensureFlagExists('ignoreDeclaration', t),
      g.ensureFlagExists('ignoreInstruction', t),
      g.ensureFlagExists('ignoreAttributes', t),
      g.ensureFlagExists('ignoreText', t),
      g.ensureFlagExists('ignoreComment', t),
      g.ensureFlagExists('ignoreCdata', t),
      g.ensureFlagExists('ignoreDoctype', t),
      g.ensureFlagExists('compact', t),
      g.ensureFlagExists('indentText', t),
      g.ensureFlagExists('indentCdata', t),
      g.ensureFlagExists('indentAttributes', t),
      g.ensureFlagExists('indentInstruction', t),
      g.ensureFlagExists('fullTagEmptyElement', t),
      g.ensureFlagExists('noQuotesForNativeAttributes', t),
      g.ensureSpacesExists(t),
      typeof t.spaces == 'number' && (t.spaces = Array(t.spaces + 1).join(' ')),
      g.ensureKeyExists('declaration', t),
      g.ensureKeyExists('instruction', t),
      g.ensureKeyExists('attributes', t),
      g.ensureKeyExists('text', t),
      g.ensureKeyExists('comment', t),
      g.ensureKeyExists('cdata', t),
      g.ensureKeyExists('doctype', t),
      g.ensureKeyExists('type', t),
      g.ensureKeyExists('name', t),
      g.ensureKeyExists('elements', t),
      g.checkFnExists('doctype', t),
      g.checkFnExists('instruction', t),
      g.checkFnExists('cdata', t),
      g.checkFnExists('comment', t),
      g.checkFnExists('text', t),
      g.checkFnExists('instructionName', t),
      g.checkFnExists('elementName', t),
      g.checkFnExists('attributeName', t),
      g.checkFnExists('attributeValue', t),
      g.checkFnExists('attributes', t),
      g.checkFnExists('fullTagEmptyElement', t),
      t
    );
  }
  function v(i, t, u) {
    return (
      (!u && i.spaces
        ? `
`
        : '') + Array(t + 1).join(i.spaces)
    );
  }
  function Y(i, t, u) {
    if (t.ignoreAttributes) return '';
    'attributesFn' in t && (i = t.attributesFn(i, I, h));
    var o,
      l,
      E,
      m,
      N = [];
    for (o in i)
      i.hasOwnProperty(o) &&
        i[o] !== null &&
        i[o] !== void 0 &&
        ((m =
          t.noQuotesForNativeAttributes && typeof i[o] != 'string' ? '' : '"'),
        (l = '' + i[o]),
        (l = l.replace(/"/g, '&quot;')),
        (E = 'attributeNameFn' in t ? t.attributeNameFn(o, l, I, h) : o),
        N.push(t.spaces && t.indentAttributes ? v(t, u + 1, !1) : ' '),
        N.push(
          E +
            '=' +
            m +
            ('attributeValueFn' in t ? t.attributeValueFn(l, o, I, h) : l) +
            m
        ));
    return (
      i &&
        Object.keys(i).length &&
        t.spaces &&
        t.indentAttributes &&
        N.push(v(t, u, !1)),
      N.join('')
    );
  }
  function Ie(i, t, u) {
    return (
      (h = i),
      (I = 'xml'),
      t.ignoreDeclaration ? '' : '<?xml' + Y(i[t.attributesKey], t, u) + '?>'
    );
  }
  function xe(i, t, u) {
    if (t.ignoreInstruction) return '';
    var o;
    for (o in i) if (i.hasOwnProperty(o)) break;
    var l = 'instructionNameFn' in t ? t.instructionNameFn(o, i[o], I, h) : o;
    if (typeof i[o] == 'object')
      return (h = i), (I = l), '<?' + l + Y(i[o][t.attributesKey], t, u) + '?>';
    var E = i[o] ? i[o] : '';
    return (
      'instructionFn' in t && (E = t.instructionFn(E, o, I, h)),
      '<?' + l + (E ? ' ' + E : '') + '?>'
    );
  }
  function De(i, t) {
    return t.ignoreComment
      ? ''
      : '<!--' + ('commentFn' in t ? t.commentFn(i, I, h) : i) + '-->';
  }
  function Ce(i, t) {
    return t.ignoreCdata
      ? ''
      : '<![CDATA[' +
          ('cdataFn' in t
            ? t.cdataFn(i, I, h)
            : i.replace(']]>', ']]]]><![CDATA[>')) +
          ']]>';
  }
  function ve(i, t) {
    return t.ignoreDoctype
      ? ''
      : '<!DOCTYPE ' + ('doctypeFn' in t ? t.doctypeFn(i, I, h) : i) + '>';
  }
  function te(i, t) {
    return t.ignoreText
      ? ''
      : ((i = '' + i),
        (i = i.replace(/&amp;/g, '&')),
        (i = i
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')),
        'textFn' in t ? t.textFn(i, I, h) : i);
  }
  function st(i, t) {
    var u;
    if (i.elements && i.elements.length)
      for (u = 0; u < i.elements.length; ++u)
        switch (i.elements[u][t.typeKey]) {
          case 'text':
            if (t.indentText) return !0;
            break;
          case 'cdata':
            if (t.indentCdata) return !0;
            break;
          case 'instruction':
            if (t.indentInstruction) return !0;
            break;
          case 'doctype':
          case 'comment':
          case 'element':
            return !0;
          default:
            return !0;
        }
    return !1;
  }
  function ut(i, t, u) {
    (h = i), (I = i.name);
    var o = [],
      l = 'elementNameFn' in t ? t.elementNameFn(i.name, i) : i.name;
    o.push('<' + l), i[t.attributesKey] && o.push(Y(i[t.attributesKey], t, u));
    var E =
      (i[t.elementsKey] && i[t.elementsKey].length) ||
      (i[t.attributesKey] && i[t.attributesKey]['xml:space'] === 'preserve');
    return (
      E ||
        ('fullTagEmptyElementFn' in t
          ? (E = t.fullTagEmptyElementFn(i.name, i))
          : (E = t.fullTagEmptyElement)),
      E
        ? (o.push('>'),
          i[t.elementsKey] &&
            i[t.elementsKey].length &&
            (o.push(Oe(i[t.elementsKey], t, u + 1)), (h = i), (I = i.name)),
          o.push(
            t.spaces && st(i, t)
              ? `
          ` + Array(u + 1).join(t.spaces)
              : ''
          ),
          o.push('</' + l + '>'))
        : o.push('/>'),
      o.join('')
    );
  }
  function Oe(i, t, u, o) {
    return i.reduce(function (l, E) {
      var m = v(t, u, o && !l);
      switch (E.type) {
        case 'element':
          return l + m + ut(E, t, u);
        case 'comment':
          return l + m + De(E[t.commentKey], t);
        case 'doctype':
          return l + m + ve(E[t.doctypeKey], t);
        case 'cdata':
          return l + (t.indentCdata ? m : '') + Ce(E[t.cdataKey], t);
        case 'text':
          return l + (t.indentText ? m : '') + te(E[t.textKey], t);
        case 'instruction':
          var N = {};
          return (
            (N[E[t.nameKey]] = E[t.attributesKey] ? E : E[t.instructionKey]),
            l + (t.indentInstruction ? m : '') + xe(N, t, u)
          );
      }
    }, '');
  }
  function we(i, t, u) {
    var o;
    for (o in i)
      if (i.hasOwnProperty(o))
        switch (o) {
          case t.parentKey:
          case t.attributesKey:
            break;
          case t.textKey:
            if (t.indentText || u) return !0;
            break;
          case t.cdataKey:
            if (t.indentCdata || u) return !0;
            break;
          case t.instructionKey:
            if (t.indentInstruction || u) return !0;
            break;
          case t.doctypeKey:
          case t.commentKey:
            return !0;
          default:
            return !0;
        }
    return !1;
  }
  function ct(i, t, u, o, l) {
    (h = i), (I = t);
    var E = 'elementNameFn' in u ? u.elementNameFn(t, i) : t;
    if (typeof i > 'u' || i === null || i === '')
      return ('fullTagEmptyElementFn' in u && u.fullTagEmptyElementFn(t, i)) ||
        u.fullTagEmptyElement
        ? '<' + E + '></' + E + '>'
        : '<' + E + '/>';
    var m = [];
    if (t) {
      if ((m.push('<' + E), typeof i != 'object'))
        return m.push('>' + te(i, u) + '</' + E + '>'), m.join('');
      i[u.attributesKey] && m.push(Y(i[u.attributesKey], u, o));
      var N =
        we(i, u, !0) ||
        (i[u.attributesKey] && i[u.attributesKey]['xml:space'] === 'preserve');
      if (
        (N ||
          ('fullTagEmptyElementFn' in u
            ? (N = u.fullTagEmptyElementFn(t, i))
            : (N = u.fullTagEmptyElement)),
        N)
      )
        m.push('>');
      else return m.push('/>'), m.join('');
    }
    return (
      m.push(Se(i, u, o + 1, !1)),
      (h = i),
      (I = t),
      t && m.push((l ? v(u, o, !1) : '') + '</' + E + '>'),
      m.join('')
    );
  }
  function Se(i, t, u, o) {
    var l,
      E,
      m,
      N = [];
    for (E in i)
      if (i.hasOwnProperty(E))
        for (m = at(i[E]) ? i[E] : [i[E]], l = 0; l < m.length; ++l) {
          switch (E) {
            case t.declarationKey:
              N.push(Ie(m[l], t, u));
              break;
            case t.instructionKey:
              N.push((t.indentInstruction ? v(t, u, o) : '') + xe(m[l], t, u));
              break;
            case t.attributesKey:
            case t.parentKey:
              break;
            case t.textKey:
              N.push((t.indentText ? v(t, u, o) : '') + te(m[l], t));
              break;
            case t.cdataKey:
              N.push((t.indentCdata ? v(t, u, o) : '') + Ce(m[l], t));
              break;
            case t.doctypeKey:
              N.push(v(t, u, o) + ve(m[l], t));
              break;
            case t.commentKey:
              N.push(v(t, u, o) + De(m[l], t));
              break;
            default:
              N.push(v(t, u, o) + ct(m[l], E, t, u, we(m[l], t)));
          }
          o = o && !N.length;
        }
    return N.join('');
  }
  Ke.exports = function (i, t) {
    t = rt(t);
    var u = [];
    return (
      (h = i),
      (I = '_root_'),
      t.compact
        ? u.push(Se(i, t, 0, !0))
        : (i[t.declarationKey] && u.push(Ie(i[t.declarationKey], t, 0)),
          i[t.elementsKey] &&
            i[t.elementsKey].length &&
            u.push(Oe(i[t.elementsKey], t, 0, !u.length))),
      u.join('')
    );
  };
});
var Re = K((bt, Pe) => {
  var ot = ne();
  Pe.exports = function (i, t) {
    i instanceof Buffer && (i = i.toString());
    var u = null;
    if (typeof i == 'string')
      try {
        u = JSON.parse(i);
      } catch {
        throw new Error('The JSON structure is invalid');
      }
    else u = i;
    return ot(u, t);
  };
});
var pe = K((_t, Be) => {
  var lt = ee(),
    ft = he(),
    Et = ne(),
    mt = Re();
  Be.exports = { xml2js: lt, xml2json: ft, js2xml: Et, json2xml: mt };
});
module.exports = pe();
/*! Bundled license information:

sax/lib/sax.js:
  (*! http://mths.be/fromcodepoint v0.1.0 by @mathias *)
*/
