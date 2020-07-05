/**
 * Owl Carousel v2.2.1
 * Copyright 2013-2017 David Deutsch
 * Licensed under  ()
 */
!(function (a, b, c, d) {
  function e(b, c) {
    (this.settings = null),
      (this.options = a.extend({}, e.Defaults, c)),
      (this.$element = a(b)),
      (this._handlers = {}),
      (this._plugins = {}),
      (this._supress = {}),
      (this._current = null),
      (this._speed = null),
      (this._coordinates = []),
      (this._breakpoint = null),
      (this._width = null),
      (this._items = []),
      (this._clones = []),
      (this._mergers = []),
      (this._widths = []),
      (this._invalidated = {}),
      (this._pipe = []),
      (this._drag = {
        time: null,
        target: null,
        pointer: null,
        stage: { start: null, current: null },
        direction: null,
      }),
      (this._states = {
        current: {},
        tags: {
          initializing: ["busy"],
          animating: ["busy"],
          dragging: ["interacting"],
        },
      }),
      a.each(
        ["onResize", "onThrottledResize"],
        a.proxy(function (b, c) {
          this._handlers[c] = a.proxy(this[c], this);
        }, this)
      ),
      a.each(
        e.Plugins,
        a.proxy(function (a, b) {
          this._plugins[a.charAt(0).toLowerCase() + a.slice(1)] = new b(this);
        }, this)
      ),
      a.each(
        e.Workers,
        a.proxy(function (b, c) {
          this._pipe.push({ filter: c.filter, run: a.proxy(c.run, this) });
        }, this)
      ),
      this.setup(),
      this.initialize();
  }
  (e.Defaults = {
    items: 3,
    loop: !1,
    center: !1,
    rewind: !1,
    mouseDrag: !0,
    touchDrag: !0,
    pullDrag: !0,
    freeDrag: !1,
    margin: 0,
    stagePadding: 0,
    merge: !1,
    mergeFit: !0,
    autoWidth: !1,
    startPosition: 0,
    rtl: !1,
    smartSpeed: 250,
    fluidSpeed: !1,
    dragEndSpeed: !1,
    responsive: {},
    responsiveRefreshRate: 200,
    responsiveBaseElement: b,
    fallbackEasing: "swing",
    info: !1,
    nestedItemSelector: !1,
    itemElement: "div",
    stageElement: "div",
    refreshClass: "owl-refresh",
    loadedClass: "owl-loaded",
    loadingClass: "owl-loading",
    rtlClass: "owl-rtl",
    responsiveClass: "owl-responsive",
    dragClass: "owl-drag",
    itemClass: "owl-item",
    stageClass: "owl-stage",
    stageOuterClass: "owl-stage-outer",
    grabClass: "owl-grab",
  }),
    (e.Width = { Default: "default", Inner: "inner", Outer: "outer" }),
    (e.Type = { Event: "event", State: "state" }),
    (e.Plugins = {}),
    (e.Workers = [
      {
        filter: ["width", "settings"],
        run: function () {
          this._width = this.$element.width();
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (a) {
          a.current = this._items && this._items[this.relative(this._current)];
        },
      },
      {
        filter: ["items", "settings"],
        run: function () {
          this.$stage.children(".cloned").remove();
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (a) {
          var b = this.settings.margin || "",
            c = !this.settings.autoWidth,
            d = this.settings.rtl,
            e = {
              width: "auto",
              "margin-left": d ? b : "",
              "margin-right": d ? "" : b,
            };
          !c && this.$stage.children().css(e), (a.css = e);
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (a) {
          var b =
              (this.width() / this.settings.items).toFixed(3) -
              this.settings.margin,
            c = null,
            d = this._items.length,
            e = !this.settings.autoWidth,
            f = [];
          for (a.items = { merge: !1, width: b }; d--; )
            (c = this._mergers[d]),
              (c =
                (this.settings.mergeFit && Math.min(c, this.settings.items)) ||
                c),
              (a.items.merge = c > 1 || a.items.merge),
              (f[d] = e ? b * c : this._items[d].width());
          this._widths = f;
        },
      },
      {
        filter: ["items", "settings"],
        run: function () {
          var b = [],
            c = this._items,
            d = this.settings,
            e = Math.max(2 * d.items, 4),
            f = 2 * Math.ceil(c.length / 2),
            g = d.loop && c.length ? (d.rewind ? e : Math.max(e, f)) : 0,
            h = "",
            i = "";
          for (g /= 2; g--; )
            b.push(this.normalize(b.length / 2, !0)),
              (h += c[b[b.length - 1]][0].outerHTML),
              b.push(this.normalize(c.length - 1 - (b.length - 1) / 2, !0)),
              (i = c[b[b.length - 1]][0].outerHTML + i);
          (this._clones = b),
            a(h).addClass("cloned").appendTo(this.$stage),
            a(i).addClass("cloned").prependTo(this.$stage);
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function () {
          for (
            var a = this.settings.rtl ? 1 : -1,
              b = this._clones.length + this._items.length,
              c = -1,
              d = 0,
              e = 0,
              f = [];
            ++c < b;

          )
            (d = f[c - 1] || 0),
              (e = this._widths[this.relative(c)] + this.settings.margin),
              f.push(d + e * a);
          this._coordinates = f;
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function () {
          var a = this.settings.stagePadding,
            b = this._coordinates,
            c = {
              width: Math.ceil(Math.abs(b[b.length - 1])) + 2 * a,
              "padding-left": a || "",
              "padding-right": a || "",
            };
          this.$stage.css(c);
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (a) {
          var b = this._coordinates.length,
            c = !this.settings.autoWidth,
            d = this.$stage.children();
          if (c && a.items.merge)
            for (; b--; )
              (a.css.width = this._widths[this.relative(b)]),
                d.eq(b).css(a.css);
          else c && ((a.css.width = a.items.width), d.css(a.css));
        },
      },
      {
        filter: ["items"],
        run: function () {
          this._coordinates.length < 1 && this.$stage.removeAttr("style");
        },
      },
      {
        filter: ["width", "items", "settings"],
        run: function (a) {
          (a.current = a.current ? this.$stage.children().index(a.current) : 0),
            (a.current = Math.max(
              this.minimum(),
              Math.min(this.maximum(), a.current)
            )),
            this.reset(a.current);
        },
      },
      {
        filter: ["position"],
        run: function () {
          this.animate(this.coordinates(this._current));
        },
      },
      {
        filter: ["width", "position", "items", "settings"],
        run: function () {
          var a,
            b,
            c,
            d,
            e = this.settings.rtl ? 1 : -1,
            f = 2 * this.settings.stagePadding,
            g = this.coordinates(this.current()) + f,
            h = g + this.width() * e,
            i = [];
          for (c = 0, d = this._coordinates.length; c < d; c++)
            (a = this._coordinates[c - 1] || 0),
              (b = Math.abs(this._coordinates[c]) + f * e),
              ((this.op(a, "<=", g) && this.op(a, ">", h)) ||
                (this.op(b, "<", g) && this.op(b, ">", h))) &&
                i.push(c);
          this.$stage.children(".active").removeClass("active"),
            this.$stage
              .children(":eq(" + i.join("), :eq(") + ")")
              .addClass("active"),
            this.settings.center &&
              (this.$stage.children(".center").removeClass("center"),
              this.$stage.children().eq(this.current()).addClass("center"));
        },
      },
    ]),
    (e.prototype.initialize = function () {
      if (
        (this.enter("initializing"),
        this.trigger("initialize"),
        this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl),
        this.settings.autoWidth && !this.is("pre-loading"))
      ) {
        var b, c, e;
        (b = this.$element.find("img")),
          (c = this.settings.nestedItemSelector
            ? "." + this.settings.nestedItemSelector
            : d),
          (e = this.$element.children(c).width()),
          b.length && e <= 0 && this.preloadAutoWidthImages(b);
      }
      this.$element.addClass(this.options.loadingClass),
        (this.$stage = a(
          "<" +
            this.settings.stageElement +
            ' class="' +
            this.settings.stageClass +
            '"/>'
        ).wrap('<div class="' + this.settings.stageOuterClass + '"/>')),
        this.$element.append(this.$stage.parent()),
        this.replace(this.$element.children().not(this.$stage.parent())),
        this.$element.is(":visible")
          ? this.refresh()
          : this.invalidate("width"),
        this.$element
          .removeClass(this.options.loadingClass)
          .addClass(this.options.loadedClass),
        this.registerEventHandlers(),
        this.leave("initializing"),
        this.trigger("initialized");
    }),
    (e.prototype.setup = function () {
      var b = this.viewport(),
        c = this.options.responsive,
        d = -1,
        e = null;
      c
        ? (a.each(c, function (a) {
            a <= b && a > d && (d = Number(a));
          }),
          (e = a.extend({}, this.options, c[d])),
          "function" == typeof e.stagePadding &&
            (e.stagePadding = e.stagePadding()),
          delete e.responsive,
          e.responsiveClass &&
            this.$element.attr(
              "class",
              this.$element
                .attr("class")
                .replace(
                  new RegExp(
                    "(" + this.options.responsiveClass + "-)\\S+\\s",
                    "g"
                  ),
                  "$1" + d
                )
            ))
        : (e = a.extend({}, this.options)),
        this.trigger("change", { property: { name: "settings", value: e } }),
        (this._breakpoint = d),
        (this.settings = e),
        this.invalidate("settings"),
        this.trigger("changed", {
          property: { name: "settings", value: this.settings },
        });
    }),
    (e.prototype.optionsLogic = function () {
      this.settings.autoWidth &&
        ((this.settings.stagePadding = !1), (this.settings.merge = !1));
    }),
    (e.prototype.prepare = function (b) {
      var c = this.trigger("prepare", { content: b });
      return (
        c.data ||
          (c.data = a("<" + this.settings.itemElement + "/>")
            .addClass(this.options.itemClass)
            .append(b)),
        this.trigger("prepared", { content: c.data }),
        c.data
      );
    }),
    (e.prototype.update = function () {
      for (
        var b = 0,
          c = this._pipe.length,
          d = a.proxy(function (a) {
            return this[a];
          }, this._invalidated),
          e = {};
        b < c;

      )
        (this._invalidated.all || a.grep(this._pipe[b].filter, d).length > 0) &&
          this._pipe[b].run(e),
          b++;
      (this._invalidated = {}), !this.is("valid") && this.enter("valid");
    }),
    (e.prototype.width = function (a) {
      switch ((a = a || e.Width.Default)) {
        case e.Width.Inner:
        case e.Width.Outer:
          return this._width;
        default:
          return (
            this._width - 2 * this.settings.stagePadding + this.settings.margin
          );
      }
    }),
    (e.prototype.refresh = function () {
      this.enter("refreshing"),
        this.trigger("refresh"),
        this.setup(),
        this.optionsLogic(),
        this.$element.addClass(this.options.refreshClass),
        this.update(),
        this.$element.removeClass(this.options.refreshClass),
        this.leave("refreshing"),
        this.trigger("refreshed");
    }),
    (e.prototype.onThrottledResize = function () {
      b.clearTimeout(this.resizeTimer),
        (this.resizeTimer = b.setTimeout(
          this._handlers.onResize,
          this.settings.responsiveRefreshRate
        ));
    }),
    (e.prototype.onResize = function () {
      return (
        !!this._items.length &&
        this._width !== this.$element.width() &&
        !!this.$element.is(":visible") &&
        (this.enter("resizing"),
        this.trigger("resize").isDefaultPrevented()
          ? (this.leave("resizing"), !1)
          : (this.invalidate("width"),
            this.refresh(),
            this.leave("resizing"),
            void this.trigger("resized")))
      );
    }),
    (e.prototype.registerEventHandlers = function () {
      a.support.transition &&
        this.$stage.on(
          a.support.transition.end + ".owl.core",
          a.proxy(this.onTransitionEnd, this)
        ),
        this.settings.responsive !== !1 &&
          this.on(b, "resize", this._handlers.onThrottledResize),
        this.settings.mouseDrag &&
          (this.$element.addClass(this.options.dragClass),
          this.$stage.on("mousedown.owl.core", a.proxy(this.onDragStart, this)),
          this.$stage.on(
            "dragstart.owl.core selectstart.owl.core",
            function () {
              return !1;
            }
          )),
        this.settings.touchDrag &&
          (this.$stage.on(
            "touchstart.owl.core",
            a.proxy(this.onDragStart, this)
          ),
          this.$stage.on(
            "touchcancel.owl.core",
            a.proxy(this.onDragEnd, this)
          ));
    }),
    (e.prototype.onDragStart = function (b) {
      var d = null;
      3 !== b.which &&
        (a.support.transform
          ? ((d = this.$stage
              .css("transform")
              .replace(/.*\(|\)| /g, "")
              .split(",")),
            (d = {
              x: d[16 === d.length ? 12 : 4],
              y: d[16 === d.length ? 13 : 5],
            }))
          : ((d = this.$stage.position()),
            (d = {
              x: this.settings.rtl
                ? d.left +
                  this.$stage.width() -
                  this.width() +
                  this.settings.margin
                : d.left,
              y: d.top,
            })),
        this.is("animating") &&
          (a.support.transform ? this.animate(d.x) : this.$stage.stop(),
          this.invalidate("position")),
        this.$element.toggleClass(
          this.options.grabClass,
          "mousedown" === b.type
        ),
        this.speed(0),
        (this._drag.time = new Date().getTime()),
        (this._drag.target = a(b.target)),
        (this._drag.stage.start = d),
        (this._drag.stage.current = d),
        (this._drag.pointer = this.pointer(b)),
        a(c).on(
          "mouseup.owl.core touchend.owl.core",
          a.proxy(this.onDragEnd, this)
        ),
        a(c).one(
          "mousemove.owl.core touchmove.owl.core",
          a.proxy(function (b) {
            var d = this.difference(this._drag.pointer, this.pointer(b));
            a(c).on(
              "mousemove.owl.core touchmove.owl.core",
              a.proxy(this.onDragMove, this)
            ),
              (Math.abs(d.x) < Math.abs(d.y) && this.is("valid")) ||
                (b.preventDefault(),
                this.enter("dragging"),
                this.trigger("drag"));
          }, this)
        ));
    }),
    (e.prototype.onDragMove = function (a) {
      var b = null,
        c = null,
        d = null,
        e = this.difference(this._drag.pointer, this.pointer(a)),
        f = this.difference(this._drag.stage.start, e);
      this.is("dragging") &&
        (a.preventDefault(),
        this.settings.loop
          ? ((b = this.coordinates(this.minimum())),
            (c = this.coordinates(this.maximum() + 1) - b),
            (f.x = ((((f.x - b) % c) + c) % c) + b))
          : ((b = this.settings.rtl
              ? this.coordinates(this.maximum())
              : this.coordinates(this.minimum())),
            (c = this.settings.rtl
              ? this.coordinates(this.minimum())
              : this.coordinates(this.maximum())),
            (d = this.settings.pullDrag ? (-1 * e.x) / 5 : 0),
            (f.x = Math.max(Math.min(f.x, b + d), c + d))),
        (this._drag.stage.current = f),
        this.animate(f.x));
    }),
    (e.prototype.onDragEnd = function (b) {
      var d = this.difference(this._drag.pointer, this.pointer(b)),
        e = this._drag.stage.current,
        f = (d.x > 0) ^ this.settings.rtl ? "left" : "right";
      a(c).off(".owl.core"),
        this.$element.removeClass(this.options.grabClass),
        ((0 !== d.x && this.is("dragging")) || !this.is("valid")) &&
          (this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed),
          this.current(this.closest(e.x, 0 !== d.x ? f : this._drag.direction)),
          this.invalidate("position"),
          this.update(),
          (this._drag.direction = f),
          (Math.abs(d.x) > 3 || new Date().getTime() - this._drag.time > 300) &&
            this._drag.target.one("click.owl.core", function () {
              return !1;
            })),
        this.is("dragging") &&
          (this.leave("dragging"), this.trigger("dragged"));
    }),
    (e.prototype.closest = function (b, c) {
      var d = -1,
        e = 30,
        f = this.width(),
        g = this.coordinates();
      return (
        this.settings.freeDrag ||
          a.each(
            g,
            a.proxy(function (a, h) {
              return (
                "left" === c && b > h - e && b < h + e
                  ? (d = a)
                  : "right" === c && b > h - f - e && b < h - f + e
                  ? (d = a + 1)
                  : this.op(b, "<", h) &&
                    this.op(b, ">", g[a + 1] || h - f) &&
                    (d = "left" === c ? a + 1 : a),
                d === -1
              );
            }, this)
          ),
        this.settings.loop ||
          (this.op(b, ">", g[this.minimum()])
            ? (d = b = this.minimum())
            : this.op(b, "<", g[this.maximum()]) && (d = b = this.maximum())),
        d
      );
    }),
    (e.prototype.animate = function (b) {
      var c = this.speed() > 0;
      this.is("animating") && this.onTransitionEnd(),
        c && (this.enter("animating"), this.trigger("translate")),
        a.support.transform3d && a.support.transition
          ? this.$stage.css({
              transform: "translate3d(" + b + "px,0px,0px)",
              transition: this.speed() / 1e3 + "s",
            })
          : c
          ? this.$stage.animate(
              { left: b + "px" },
              this.speed(),
              this.settings.fallbackEasing,
              a.proxy(this.onTransitionEnd, this)
            )
          : this.$stage.css({ left: b + "px" });
    }),
    (e.prototype.is = function (a) {
      return this._states.current[a] && this._states.current[a] > 0;
    }),
    (e.prototype.current = function (a) {
      if (a === d) return this._current;
      if (0 === this._items.length) return d;
      if (((a = this.normalize(a)), this._current !== a)) {
        var b = this.trigger("change", {
          property: { name: "position", value: a },
        });
        b.data !== d && (a = this.normalize(b.data)),
          (this._current = a),
          this.invalidate("position"),
          this.trigger("changed", {
            property: { name: "position", value: this._current },
          });
      }
      return this._current;
    }),
    (e.prototype.invalidate = function (b) {
      return (
        "string" === a.type(b) &&
          ((this._invalidated[b] = !0),
          this.is("valid") && this.leave("valid")),
        a.map(this._invalidated, function (a, b) {
          return b;
        })
      );
    }),
    (e.prototype.reset = function (a) {
      (a = this.normalize(a)),
        a !== d &&
          ((this._speed = 0),
          (this._current = a),
          this.suppress(["translate", "translated"]),
          this.animate(this.coordinates(a)),
          this.release(["translate", "translated"]));
    }),
    (e.prototype.normalize = function (a, b) {
      var c = this._items.length,
        e = b ? 0 : this._clones.length;
      return (
        !this.isNumeric(a) || c < 1
          ? (a = d)
          : (a < 0 || a >= c + e) &&
            (a = ((((a - e / 2) % c) + c) % c) + e / 2),
        a
      );
    }),
    (e.prototype.relative = function (a) {
      return (a -= this._clones.length / 2), this.normalize(a, !0);
    }),
    (e.prototype.maximum = function (a) {
      var b,
        c,
        d,
        e = this.settings,
        f = this._coordinates.length;
      if (e.loop) f = this._clones.length / 2 + this._items.length - 1;
      else if (e.autoWidth || e.merge) {
        for (
          b = this._items.length,
            c = this._items[--b].width(),
            d = this.$element.width();
          b-- &&
          ((c += this._items[b].width() + this.settings.margin), !(c > d));

        );
        f = b + 1;
      } else
        f = e.center ? this._items.length - 1 : this._items.length - e.items;
      return a && (f -= this._clones.length / 2), Math.max(f, 0);
    }),
    (e.prototype.minimum = function (a) {
      return a ? 0 : this._clones.length / 2;
    }),
    (e.prototype.items = function (a) {
      return a === d
        ? this._items.slice()
        : ((a = this.normalize(a, !0)), this._items[a]);
    }),
    (e.prototype.mergers = function (a) {
      return a === d
        ? this._mergers.slice()
        : ((a = this.normalize(a, !0)), this._mergers[a]);
    }),
    (e.prototype.clones = function (b) {
      var c = this._clones.length / 2,
        e = c + this._items.length,
        f = function (a) {
          return a % 2 === 0 ? e + a / 2 : c - (a + 1) / 2;
        };
      return b === d
        ? a.map(this._clones, function (a, b) {
            return f(b);
          })
        : a.map(this._clones, function (a, c) {
            return a === b ? f(c) : null;
          });
    }),
    (e.prototype.speed = function (a) {
      return a !== d && (this._speed = a), this._speed;
    }),
    (e.prototype.coordinates = function (b) {
      var c,
        e = 1,
        f = b - 1;
      return b === d
        ? a.map(
            this._coordinates,
            a.proxy(function (a, b) {
              return this.coordinates(b);
            }, this)
          )
        : (this.settings.center
            ? (this.settings.rtl && ((e = -1), (f = b + 1)),
              (c = this._coordinates[b]),
              (c += ((this.width() - c + (this._coordinates[f] || 0)) / 2) * e))
            : (c = this._coordinates[f] || 0),
          (c = Math.ceil(c)));
    }),
    (e.prototype.duration = function (a, b, c) {
      return 0 === c
        ? 0
        : Math.min(Math.max(Math.abs(b - a), 1), 6) *
            Math.abs(c || this.settings.smartSpeed);
    }),
    (e.prototype.to = function (a, b) {
      var c = this.current(),
        d = null,
        e = a - this.relative(c),
        f = (e > 0) - (e < 0),
        g = this._items.length,
        h = this.minimum(),
        i = this.maximum();
      this.settings.loop
        ? (!this.settings.rewind && Math.abs(e) > g / 2 && (e += f * -1 * g),
          (a = c + e),
          (d = ((((a - h) % g) + g) % g) + h),
          d !== a &&
            d - e <= i &&
            d - e > 0 &&
            ((c = d - e), (a = d), this.reset(c)))
        : this.settings.rewind
        ? ((i += 1), (a = ((a % i) + i) % i))
        : (a = Math.max(h, Math.min(i, a))),
        this.speed(this.duration(c, a, b)),
        this.current(a),
        this.$element.is(":visible") && this.update();
    }),
    (e.prototype.next = function (a) {
      (a = a || !1), this.to(this.relative(this.current()) + 1, a);
    }),
    (e.prototype.prev = function (a) {
      (a = a || !1), this.to(this.relative(this.current()) - 1, a);
    }),
    (e.prototype.onTransitionEnd = function (a) {
      if (
        a !== d &&
        (a.stopPropagation(),
        (a.target || a.srcElement || a.originalTarget) !== this.$stage.get(0))
      )
        return !1;
      this.leave("animating"), this.trigger("translated");
    }),
    (e.prototype.viewport = function () {
      var d;
      return (
        this.options.responsiveBaseElement !== b
          ? (d = a(this.options.responsiveBaseElement).width())
          : b.innerWidth
          ? (d = b.innerWidth)
          : c.documentElement && c.documentElement.clientWidth
          ? (d = c.documentElement.clientWidth)
          : console.warn("Can not detect viewport width."),
        d
      );
    }),
    (e.prototype.replace = function (b) {
      this.$stage.empty(),
        (this._items = []),
        b && (b = b instanceof jQuery ? b : a(b)),
        this.settings.nestedItemSelector &&
          (b = b.find("." + this.settings.nestedItemSelector)),
        b
          .filter(function () {
            return 1 === this.nodeType;
          })
          .each(
            a.proxy(function (a, b) {
              (b = this.prepare(b)),
                this.$stage.append(b),
                this._items.push(b),
                this._mergers.push(
                  1 *
                    b
                      .find("[data-merge]")
                      .addBack("[data-merge]")
                      .attr("data-merge") || 1
                );
            }, this)
          ),
        this.reset(
          this.isNumeric(this.settings.startPosition)
            ? this.settings.startPosition
            : 0
        ),
        this.invalidate("items");
    }),
    (e.prototype.add = function (b, c) {
      var e = this.relative(this._current);
      (c = c === d ? this._items.length : this.normalize(c, !0)),
        (b = b instanceof jQuery ? b : a(b)),
        this.trigger("add", { content: b, position: c }),
        (b = this.prepare(b)),
        0 === this._items.length || c === this._items.length
          ? (0 === this._items.length && this.$stage.append(b),
            0 !== this._items.length && this._items[c - 1].after(b),
            this._items.push(b),
            this._mergers.push(
              1 *
                b
                  .find("[data-merge]")
                  .addBack("[data-merge]")
                  .attr("data-merge") || 1
            ))
          : (this._items[c].before(b),
            this._items.splice(c, 0, b),
            this._mergers.splice(
              c,
              0,
              1 *
                b
                  .find("[data-merge]")
                  .addBack("[data-merge]")
                  .attr("data-merge") || 1
            )),
        this._items[e] && this.reset(this._items[e].index()),
        this.invalidate("items"),
        this.trigger("added", { content: b, position: c });
    }),
    (e.prototype.remove = function (a) {
      (a = this.normalize(a, !0)),
        a !== d &&
          (this.trigger("remove", { content: this._items[a], position: a }),
          this._items[a].remove(),
          this._items.splice(a, 1),
          this._mergers.splice(a, 1),
          this.invalidate("items"),
          this.trigger("removed", { content: null, position: a }));
    }),
    (e.prototype.preloadAutoWidthImages = function (b) {
      b.each(
        a.proxy(function (b, c) {
          this.enter("pre-loading"),
            (c = a(c)),
            a(new Image())
              .one(
                "load",
                a.proxy(function (a) {
                  c.attr("src", a.target.src),
                    c.css("opacity", 1),
                    this.leave("pre-loading"),
                    !this.is("pre-loading") &&
                      !this.is("initializing") &&
                      this.refresh();
                }, this)
              )
              .attr(
                "src",
                c.attr("src") || c.attr("data-src") || c.attr("data-src-retina")
              );
        }, this)
      );
    }),
    (e.prototype.destroy = function () {
      this.$element.off(".owl.core"),
        this.$stage.off(".owl.core"),
        a(c).off(".owl.core"),
        this.settings.responsive !== !1 &&
          (b.clearTimeout(this.resizeTimer),
          this.off(b, "resize", this._handlers.onThrottledResize));
      for (var d in this._plugins) this._plugins[d].destroy();
      this.$stage.children(".cloned").remove(),
        this.$stage.unwrap(),
        this.$stage.children().contents().unwrap(),
        this.$stage.children().unwrap(),
        this.$element
          .removeClass(this.options.refreshClass)
          .removeClass(this.options.loadingClass)
          .removeClass(this.options.loadedClass)
          .removeClass(this.options.rtlClass)
          .removeClass(this.options.dragClass)
          .removeClass(this.options.grabClass)
          .attr(
            "class",
            this.$element
              .attr("class")
              .replace(
                new RegExp(this.options.responsiveClass + "-\\S+\\s", "g"),
                ""
              )
          )
          .removeData("owl.carousel");
    }),
    (e.prototype.op = function (a, b, c) {
      var d = this.settings.rtl;
      switch (b) {
        case "<":
          return d ? a > c : a < c;
        case ">":
          return d ? a < c : a > c;
        case ">=":
          return d ? a <= c : a >= c;
        case "<=":
          return d ? a >= c : a <= c;
      }
    }),
    (e.prototype.on = function (a, b, c, d) {
      a.addEventListener
        ? a.addEventListener(b, c, d)
        : a.attachEvent && a.attachEvent("on" + b, c);
    }),
    (e.prototype.off = function (a, b, c, d) {
      a.removeEventListener
        ? a.removeEventListener(b, c, d)
        : a.detachEvent && a.detachEvent("on" + b, c);
    }),
    (e.prototype.trigger = function (b, c, d, f, g) {
      var h = { item: { count: this._items.length, index: this.current() } },
        i = a.camelCase(
          a
            .grep(["on", b, d], function (a) {
              return a;
            })
            .join("-")
            .toLowerCase()
        ),
        j = a.Event(
          [b, "owl", d || "carousel"].join(".").toLowerCase(),
          a.extend({ relatedTarget: this }, h, c)
        );
      return (
        this._supress[b] ||
          (a.each(this._plugins, function (a, b) {
            b.onTrigger && b.onTrigger(j);
          }),
          this.register({ type: e.Type.Event, name: b }),
          this.$element.trigger(j),
          this.settings &&
            "function" == typeof this.settings[i] &&
            this.settings[i].call(this, j)),
        j
      );
    }),
    (e.prototype.enter = function (b) {
      a.each(
        [b].concat(this._states.tags[b] || []),
        a.proxy(function (a, b) {
          this._states.current[b] === d && (this._states.current[b] = 0),
            this._states.current[b]++;
        }, this)
      );
    }),
    (e.prototype.leave = function (b) {
      a.each(
        [b].concat(this._states.tags[b] || []),
        a.proxy(function (a, b) {
          this._states.current[b]--;
        }, this)
      );
    }),
    (e.prototype.register = function (b) {
      if (b.type === e.Type.Event) {
        if (
          (a.event.special[b.name] || (a.event.special[b.name] = {}),
          !a.event.special[b.name].owl)
        ) {
          var c = a.event.special[b.name]._default;
          (a.event.special[b.name]._default = function (a) {
            return !c ||
              !c.apply ||
              (a.namespace && a.namespace.indexOf("owl") !== -1)
              ? a.namespace && a.namespace.indexOf("owl") > -1
              : c.apply(this, arguments);
          }),
            (a.event.special[b.name].owl = !0);
        }
      } else
        b.type === e.Type.State &&
          (this._states.tags[b.name]
            ? (this._states.tags[b.name] = this._states.tags[b.name].concat(
                b.tags
              ))
            : (this._states.tags[b.name] = b.tags),
          (this._states.tags[b.name] = a.grep(
            this._states.tags[b.name],
            a.proxy(function (c, d) {
              return a.inArray(c, this._states.tags[b.name]) === d;
            }, this)
          )));
    }),
    (e.prototype.suppress = function (b) {
      a.each(
        b,
        a.proxy(function (a, b) {
          this._supress[b] = !0;
        }, this)
      );
    }),
    (e.prototype.release = function (b) {
      a.each(
        b,
        a.proxy(function (a, b) {
          delete this._supress[b];
        }, this)
      );
    }),
    (e.prototype.pointer = function (a) {
      var c = { x: null, y: null };
      return (
        (a = a.originalEvent || a || b.event),
        (a =
          a.touches && a.touches.length
            ? a.touches[0]
            : a.changedTouches && a.changedTouches.length
            ? a.changedTouches[0]
            : a),
        a.pageX
          ? ((c.x = a.pageX), (c.y = a.pageY))
          : ((c.x = a.clientX), (c.y = a.clientY)),
        c
      );
    }),
    (e.prototype.isNumeric = function (a) {
      return !isNaN(parseFloat(a));
    }),
    (e.prototype.difference = function (a, b) {
      return { x: a.x - b.x, y: a.y - b.y };
    }),
    (a.fn.owlCarousel = function (b) {
      var c = Array.prototype.slice.call(arguments, 1);
      return this.each(function () {
        var d = a(this),
          f = d.data("owl.carousel");
        f ||
          ((f = new e(this, "object" == typeof b && b)),
          d.data("owl.carousel", f),
          a.each(
            [
              "next",
              "prev",
              "to",
              "destroy",
              "refresh",
              "replace",
              "add",
              "remove",
            ],
            function (b, c) {
              f.register({ type: e.Type.Event, name: c }),
                f.$element.on(
                  c + ".owl.carousel.core",
                  a.proxy(function (a) {
                    a.namespace &&
                      a.relatedTarget !== this &&
                      (this.suppress([c]),
                      f[c].apply(this, [].slice.call(arguments, 1)),
                      this.release([c]));
                  }, f)
                );
            }
          )),
          "string" == typeof b && "_" !== b.charAt(0) && f[b].apply(f, c);
      });
    }),
    (a.fn.owlCarousel.Constructor = e);
})(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this._core = b),
        (this._interval = null),
        (this._visible = null),
        (this._handlers = {
          "initialized.owl.carousel": a.proxy(function (a) {
            a.namespace && this._core.settings.autoRefresh && this.watch();
          }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (e.Defaults = { autoRefresh: !0, autoRefreshInterval: 500 }),
      (e.prototype.watch = function () {
        this._interval ||
          ((this._visible = this._core.$element.is(":visible")),
          (this._interval = b.setInterval(
            a.proxy(this.refresh, this),
            this._core.settings.autoRefreshInterval
          )));
      }),
      (e.prototype.refresh = function () {
        this._core.$element.is(":visible") !== this._visible &&
          ((this._visible = !this._visible),
          this._core.$element.toggleClass("owl-hidden", !this._visible),
          this._visible &&
            this._core.invalidate("width") &&
            this._core.refresh());
      }),
      (e.prototype.destroy = function () {
        var a, c;
        b.clearInterval(this._interval);
        for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
        for (c in Object.getOwnPropertyNames(this))
          "function" != typeof this[c] && (this[c] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.AutoRefresh = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this._core = b),
        (this._loaded = []),
        (this._handlers = {
          "initialized.owl.carousel change.owl.carousel resized.owl.carousel": a.proxy(
            function (b) {
              if (
                b.namespace &&
                this._core.settings &&
                this._core.settings.lazyLoad &&
                ((b.property && "position" == b.property.name) ||
                  "initialized" == b.type)
              )
                for (
                  var c = this._core.settings,
                    e = (c.center && Math.ceil(c.items / 2)) || c.items,
                    f = (c.center && e * -1) || 0,
                    g =
                      (b.property && b.property.value !== d
                        ? b.property.value
                        : this._core.current()) + f,
                    h = this._core.clones().length,
                    i = a.proxy(function (a, b) {
                      this.load(b);
                    }, this);
                  f++ < e;

                )
                  this.load(h / 2 + this._core.relative(g)),
                    h && a.each(this._core.clones(this._core.relative(g)), i),
                    g++;
            },
            this
          ),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (e.Defaults = { lazyLoad: !1 }),
      (e.prototype.load = function (c) {
        var d = this._core.$stage.children().eq(c),
          e = d && d.find(".owl-lazy");
        !e ||
          a.inArray(d.get(0), this._loaded) > -1 ||
          (e.each(
            a.proxy(function (c, d) {
              var e,
                f = a(d),
                g =
                  (b.devicePixelRatio > 1 && f.attr("data-src-retina")) ||
                  f.attr("data-src");
              this._core.trigger("load", { element: f, url: g }, "lazy"),
                f.is("img")
                  ? f
                      .one(
                        "load.owl.lazy",
                        a.proxy(function () {
                          f.css("opacity", 1),
                            this._core.trigger(
                              "loaded",
                              { element: f, url: g },
                              "lazy"
                            );
                        }, this)
                      )
                      .attr("src", g)
                  : ((e = new Image()),
                    (e.onload = a.proxy(function () {
                      f.css({
                        "background-image": 'url("' + g + '")',
                        opacity: "1",
                      }),
                        this._core.trigger(
                          "loaded",
                          { element: f, url: g },
                          "lazy"
                        );
                    }, this)),
                    (e.src = g));
            }, this)
          ),
          this._loaded.push(d.get(0)));
      }),
      (e.prototype.destroy = function () {
        var a, b;
        for (a in this.handlers) this._core.$element.off(a, this.handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
          "function" != typeof this[b] && (this[b] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Lazy = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this._core = b),
        (this._handlers = {
          "initialized.owl.carousel refreshed.owl.carousel": a.proxy(function (
            a
          ) {
            a.namespace && this._core.settings.autoHeight && this.update();
          },
          this),
          "changed.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.settings.autoHeight &&
              "position" == a.property.name &&
              this.update();
          }, this),
          "loaded.owl.lazy": a.proxy(function (a) {
            a.namespace &&
              this._core.settings.autoHeight &&
              a.element.closest("." + this._core.settings.itemClass).index() ===
                this._core.current() &&
              this.update();
          }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this._core.$element.on(this._handlers);
    };
    (e.Defaults = { autoHeight: !1, autoHeightClass: "owl-height" }),
      (e.prototype.update = function () {
        var b = this._core._current,
          c = b + this._core.settings.items,
          d = this._core.$stage.children().toArray().slice(b, c),
          e = [],
          f = 0;
        a.each(d, function (b, c) {
          e.push(a(c).height());
        }),
          (f = Math.max.apply(null, e)),
          this._core.$stage
            .parent()
            .height(f)
            .addClass(this._core.settings.autoHeightClass);
      }),
      (e.prototype.destroy = function () {
        var a, b;
        for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
          "function" != typeof this[b] && (this[b] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.AutoHeight = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this._core = b),
        (this._videos = {}),
        (this._playing = null),
        (this._handlers = {
          "initialized.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.register({
                type: "state",
                name: "playing",
                tags: ["interacting"],
              });
          }, this),
          "resize.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.settings.video &&
              this.isInFullScreen() &&
              a.preventDefault();
          }, this),
          "refreshed.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.is("resizing") &&
              this._core.$stage.find(".cloned .owl-video-frame").remove();
          }, this),
          "changed.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              "position" === a.property.name &&
              this._playing &&
              this.stop();
          }, this),
          "prepared.owl.carousel": a.proxy(function (b) {
            if (b.namespace) {
              var c = a(b.content).find(".owl-video");
              c.length &&
                (c.css("display", "none"), this.fetch(c, a(b.content)));
            }
          }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this._core.$element.on(this._handlers),
        this._core.$element.on(
          "click.owl.video",
          ".owl-video-play-icon",
          a.proxy(function (a) {
            this.play(a);
          }, this)
        );
    };
    (e.Defaults = { video: !1, videoHeight: !1, videoWidth: !1 }),
      (e.prototype.fetch = function (a, b) {
        var c = (function () {
            return a.attr("data-vimeo-id")
              ? "vimeo"
              : a.attr("data-vzaar-id")
              ? "vzaar"
              : "youtube";
          })(),
          d =
            a.attr("data-vimeo-id") ||
            a.attr("data-youtube-id") ||
            a.attr("data-vzaar-id"),
          e = a.attr("data-width") || this._core.settings.videoWidth,
          f = a.attr("data-height") || this._core.settings.videoHeight,
          g = a.attr("href");
        if (!g) throw new Error("Missing video URL.");
        if (
          ((d = g.match(
            /(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/
          )),
          d[3].indexOf("youtu") > -1)
        )
          c = "youtube";
        else if (d[3].indexOf("vimeo") > -1) c = "vimeo";
        else {
          if (!(d[3].indexOf("vzaar") > -1))
            throw new Error("Video URL not supported.");
          c = "vzaar";
        }
        (d = d[6]),
          (this._videos[g] = { type: c, id: d, width: e, height: f }),
          b.attr("data-video", g),
          this.thumbnail(a, this._videos[g]);
      }),
      (e.prototype.thumbnail = function (b, c) {
        var d,
          e,
          f,
          g =
            c.width && c.height
              ? 'style="width:' + c.width + "px;height:" + c.height + 'px;"'
              : "",
          h = b.find("img"),
          i = "src",
          j = "",
          k = this._core.settings,
          l = function (a) {
            (e = '<div class="owl-video-play-icon"></div>'),
              (d = k.lazyLoad
                ? '<div class="owl-video-tn ' +
                  j +
                  '" ' +
                  i +
                  '="' +
                  a +
                  '"></div>'
                : '<div class="owl-video-tn" style="opacity:1;background-image:url(' +
                  a +
                  ')"></div>'),
              b.after(d),
              b.after(e);
          };
        if (
          (b.wrap('<div class="owl-video-wrapper"' + g + "></div>"),
          this._core.settings.lazyLoad && ((i = "data-src"), (j = "owl-lazy")),
          h.length)
        )
          return l(h.attr(i)), h.remove(), !1;
        "youtube" === c.type
          ? ((f = "//img.youtube.com/vi/" + c.id + "/hqdefault.jpg"), l(f))
          : "vimeo" === c.type
          ? a.ajax({
              type: "GET",
              url: "//vimeo.com/api/v2/video/" + c.id + ".json",
              jsonp: "callback",
              dataType: "jsonp",
              success: function (a) {
                (f = a[0].thumbnail_large), l(f);
              },
            })
          : "vzaar" === c.type &&
            a.ajax({
              type: "GET",
              url: "//vzaar.com/api/videos/" + c.id + ".json",
              jsonp: "callback",
              dataType: "jsonp",
              success: function (a) {
                (f = a.framegrab_url), l(f);
              },
            });
      }),
      (e.prototype.stop = function () {
        this._core.trigger("stop", null, "video"),
          this._playing.find(".owl-video-frame").remove(),
          this._playing.removeClass("owl-video-playing"),
          (this._playing = null),
          this._core.leave("playing"),
          this._core.trigger("stopped", null, "video");
      }),
      (e.prototype.play = function (b) {
        var c,
          d = a(b.target),
          e = d.closest("." + this._core.settings.itemClass),
          f = this._videos[e.attr("data-video")],
          g = f.width || "100%",
          h = f.height || this._core.$stage.height();
        this._playing ||
          (this._core.enter("playing"),
          this._core.trigger("play", null, "video"),
          (e = this._core.items(this._core.relative(e.index()))),
          this._core.reset(e.index()),
          "youtube" === f.type
            ? (c =
                '<iframe width="' +
                g +
                '" height="' +
                h +
                '" src="//www.youtube.com/embed/' +
                f.id +
                "?autoplay=1&rel=0&v=" +
                f.id +
                '" frameborder="0" allowfullscreen></iframe>')
            : "vimeo" === f.type
            ? (c =
                '<iframe src="//player.vimeo.com/video/' +
                f.id +
                '?autoplay=1" width="' +
                g +
                '" height="' +
                h +
                '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>')
            : "vzaar" === f.type &&
              (c =
                '<iframe frameborder="0"height="' +
                h +
                '"width="' +
                g +
                '" allowfullscreen mozallowfullscreen webkitAllowFullScreen src="//view.vzaar.com/' +
                f.id +
                '/player?autoplay=true"></iframe>'),
          a('<div class="owl-video-frame">' + c + "</div>").insertAfter(
            e.find(".owl-video")
          ),
          (this._playing = e.addClass("owl-video-playing")));
      }),
      (e.prototype.isInFullScreen = function () {
        var b =
          c.fullscreenElement ||
          c.mozFullScreenElement ||
          c.webkitFullscreenElement;
        return b && a(b).parent().hasClass("owl-video-frame");
      }),
      (e.prototype.destroy = function () {
        var a, b;
        this._core.$element.off("click.owl.video");
        for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
          "function" != typeof this[b] && (this[b] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Video = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this.core = b),
        (this.core.options = a.extend({}, e.Defaults, this.core.options)),
        (this.swapping = !0),
        (this.previous = d),
        (this.next = d),
        (this.handlers = {
          "change.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              "position" == a.property.name &&
              ((this.previous = this.core.current()),
              (this.next = a.property.value));
          }, this),
          "drag.owl.carousel dragged.owl.carousel translated.owl.carousel": a.proxy(
            function (a) {
              a.namespace && (this.swapping = "translated" == a.type);
            },
            this
          ),
          "translate.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this.swapping &&
              (this.core.options.animateOut || this.core.options.animateIn) &&
              this.swap();
          }, this),
        }),
        this.core.$element.on(this.handlers);
    };
    (e.Defaults = { animateOut: !1, animateIn: !1 }),
      (e.prototype.swap = function () {
        if (
          1 === this.core.settings.items &&
          a.support.animation &&
          a.support.transition
        ) {
          this.core.speed(0);
          var b,
            c = a.proxy(this.clear, this),
            d = this.core.$stage.children().eq(this.previous),
            e = this.core.$stage.children().eq(this.next),
            f = this.core.settings.animateIn,
            g = this.core.settings.animateOut;
          this.core.current() !== this.previous &&
            (g &&
              ((b =
                this.core.coordinates(this.previous) -
                this.core.coordinates(this.next)),
              d
                .one(a.support.animation.end, c)
                .css({ left: b + "px" })
                .addClass("animated owl-animated-out")
                .addClass(g)),
            f &&
              e
                .one(a.support.animation.end, c)
                .addClass("animated owl-animated-in")
                .addClass(f));
        }
      }),
      (e.prototype.clear = function (b) {
        a(b.target)
          .css({ left: "" })
          .removeClass("animated owl-animated-out owl-animated-in")
          .removeClass(this.core.settings.animateIn)
          .removeClass(this.core.settings.animateOut),
          this.core.onTransitionEnd();
      }),
      (e.prototype.destroy = function () {
        var a, b;
        for (a in this.handlers) this.core.$element.off(a, this.handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
          "function" != typeof this[b] && (this[b] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Animate = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    var e = function (b) {
      (this._core = b),
        (this._timeout = null),
        (this._paused = !1),
        (this._handlers = {
          "changed.owl.carousel": a.proxy(function (a) {
            a.namespace && "settings" === a.property.name
              ? this._core.settings.autoplay
                ? this.play()
                : this.stop()
              : a.namespace &&
                "position" === a.property.name &&
                this._core.settings.autoplay &&
                this._setAutoPlayInterval();
          }, this),
          "initialized.owl.carousel": a.proxy(function (a) {
            a.namespace && this._core.settings.autoplay && this.play();
          }, this),
          "play.owl.autoplay": a.proxy(function (a, b, c) {
            a.namespace && this.play(b, c);
          }, this),
          "stop.owl.autoplay": a.proxy(function (a) {
            a.namespace && this.stop();
          }, this),
          "mouseover.owl.autoplay": a.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.pause();
          }, this),
          "mouseleave.owl.autoplay": a.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.play();
          }, this),
          "touchstart.owl.core": a.proxy(function () {
            this._core.settings.autoplayHoverPause &&
              this._core.is("rotating") &&
              this.pause();
          }, this),
          "touchend.owl.core": a.proxy(function () {
            this._core.settings.autoplayHoverPause && this.play();
          }, this),
        }),
        this._core.$element.on(this._handlers),
        (this._core.options = a.extend({}, e.Defaults, this._core.options));
    };
    (e.Defaults = {
      autoplay: !1,
      autoplayTimeout: 5e3,
      autoplayHoverPause: !1,
      autoplaySpeed: !1,
    }),
      (e.prototype.play = function (a, b) {
        (this._paused = !1),
          this._core.is("rotating") ||
            (this._core.enter("rotating"), this._setAutoPlayInterval());
      }),
      (e.prototype._getNextTimeout = function (d, e) {
        return (
          this._timeout && b.clearTimeout(this._timeout),
          b.setTimeout(
            a.proxy(function () {
              this._paused ||
                this._core.is("busy") ||
                this._core.is("interacting") ||
                c.hidden ||
                this._core.next(e || this._core.settings.autoplaySpeed);
            }, this),
            d || this._core.settings.autoplayTimeout
          )
        );
      }),
      (e.prototype._setAutoPlayInterval = function () {
        this._timeout = this._getNextTimeout();
      }),
      (e.prototype.stop = function () {
        this._core.is("rotating") &&
          (b.clearTimeout(this._timeout), this._core.leave("rotating"));
      }),
      (e.prototype.pause = function () {
        this._core.is("rotating") && (this._paused = !0);
      }),
      (e.prototype.destroy = function () {
        var a, b;
        this.stop();
        for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
          "function" != typeof this[b] && (this[b] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.autoplay = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    "use strict";
    var e = function (b) {
      (this._core = b),
        (this._initialized = !1),
        (this._pages = []),
        (this._controls = {}),
        (this._templates = []),
        (this.$element = this._core.$element),
        (this._overrides = {
          next: this._core.next,
          prev: this._core.prev,
          to: this._core.to,
        }),
        (this._handlers = {
          "prepared.owl.carousel": a.proxy(function (b) {
            b.namespace &&
              this._core.settings.dotsData &&
              this._templates.push(
                '<div class="' +
                  this._core.settings.dotClass +
                  '">' +
                  a(b.content)
                    .find("[data-dot]")
                    .addBack("[data-dot]")
                    .attr("data-dot") +
                  "</div>"
              );
          }, this),
          "added.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.settings.dotsData &&
              this._templates.splice(a.position, 0, this._templates.pop());
          }, this),
          "remove.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._core.settings.dotsData &&
              this._templates.splice(a.position, 1);
          }, this),
          "changed.owl.carousel": a.proxy(function (a) {
            a.namespace && "position" == a.property.name && this.draw();
          }, this),
          "initialized.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              !this._initialized &&
              (this._core.trigger("initialize", null, "navigation"),
              this.initialize(),
              this.update(),
              this.draw(),
              (this._initialized = !0),
              this._core.trigger("initialized", null, "navigation"));
          }, this),
          "refreshed.owl.carousel": a.proxy(function (a) {
            a.namespace &&
              this._initialized &&
              (this._core.trigger("refresh", null, "navigation"),
              this.update(),
              this.draw(),
              this._core.trigger("refreshed", null, "navigation"));
          }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this.$element.on(this._handlers);
    };
    (e.Defaults = {
      nav: !1,
      navText: ["prev", "next"],
      navSpeed: !1,
      navElement: "div",
      navContainer: !1,
      navContainerClass: "owl-nav",
      navClass: ["owl-prev", "owl-next"],
      slideBy: 1,
      dotClass: "owl-dot",
      dotsClass: "owl-dots",
      dots: !0,
      dotsEach: !1,
      dotsData: !1,
      dotsSpeed: !1,
      dotsContainer: !1,
    }),
      (e.prototype.initialize = function () {
        var b,
          c = this._core.settings;
        (this._controls.$relative = (c.navContainer
          ? a(c.navContainer)
          : a("<div>").addClass(c.navContainerClass).appendTo(this.$element)
        ).addClass("disabled")),
          (this._controls.$previous = a("<" + c.navElement + ">")
            .addClass(c.navClass[0])
            .html(c.navText[0])
            .prependTo(this._controls.$relative)
            .on(
              "click",
              a.proxy(function (a) {
                this.prev(c.navSpeed);
              }, this)
            )),
          (this._controls.$next = a("<" + c.navElement + ">")
            .addClass(c.navClass[1])
            .html(c.navText[1])
            .appendTo(this._controls.$relative)
            .on(
              "click",
              a.proxy(function (a) {
                this.next(c.navSpeed);
              }, this)
            )),
          c.dotsData ||
            (this._templates = [
              a("<div>")
                .addClass(c.dotClass)
                .append(a("<span>"))
                .prop("outerHTML"),
            ]),
          (this._controls.$absolute = (c.dotsContainer
            ? a(c.dotsContainer)
            : a("<div>").addClass(c.dotsClass).appendTo(this.$element)
          ).addClass("disabled")),
          this._controls.$absolute.on(
            "click",
            "div",
            a.proxy(function (b) {
              var d = a(b.target).parent().is(this._controls.$absolute)
                ? a(b.target).index()
                : a(b.target).parent().index();
              b.preventDefault(), this.to(d, c.dotsSpeed);
            }, this)
          );
        for (b in this._overrides) this._core[b] = a.proxy(this[b], this);
      }),
      (e.prototype.destroy = function () {
        var a, b, c, d;
        for (a in this._handlers) this.$element.off(a, this._handlers[a]);
        for (b in this._controls) this._controls[b].remove();
        for (d in this.overides) this._core[d] = this._overrides[d];
        for (c in Object.getOwnPropertyNames(this))
          "function" != typeof this[c] && (this[c] = null);
      }),
      (e.prototype.update = function () {
        var a,
          b,
          c,
          d = this._core.clones().length / 2,
          e = d + this._core.items().length,
          f = this._core.maximum(!0),
          g = this._core.settings,
          h = g.center || g.autoWidth || g.dotsData ? 1 : g.dotsEach || g.items;
        if (
          ("page" !== g.slideBy && (g.slideBy = Math.min(g.slideBy, g.items)),
          g.dots || "page" == g.slideBy)
        )
          for (this._pages = [], a = d, b = 0, c = 0; a < e; a++) {
            if (b >= h || 0 === b) {
              if (
                (this._pages.push({
                  start: Math.min(f, a - d),
                  end: a - d + h - 1,
                }),
                Math.min(f, a - d) === f)
              )
                break;
              (b = 0), ++c;
            }
            b += this._core.mergers(this._core.relative(a));
          }
      }),
      (e.prototype.draw = function () {
        var b,
          c = this._core.settings,
          d = this._core.items().length <= c.items,
          e = this._core.relative(this._core.current()),
          f = c.loop || c.rewind;
        this._controls.$relative.toggleClass("disabled", !c.nav || d),
          c.nav &&
            (this._controls.$previous.toggleClass(
              "disabled",
              !f && e <= this._core.minimum(!0)
            ),
            this._controls.$next.toggleClass(
              "disabled",
              !f && e >= this._core.maximum(!0)
            )),
          this._controls.$absolute.toggleClass("disabled", !c.dots || d),
          c.dots &&
            ((b =
              this._pages.length - this._controls.$absolute.children().length),
            c.dotsData && 0 !== b
              ? this._controls.$absolute.html(this._templates.join(""))
              : b > 0
              ? this._controls.$absolute.append(
                  new Array(b + 1).join(this._templates[0])
                )
              : b < 0 && this._controls.$absolute.children().slice(b).remove(),
            this._controls.$absolute.find(".active").removeClass("active"),
            this._controls.$absolute
              .children()
              .eq(a.inArray(this.current(), this._pages))
              .addClass("active"));
      }),
      (e.prototype.onTrigger = function (b) {
        var c = this._core.settings;
        b.page = {
          index: a.inArray(this.current(), this._pages),
          count: this._pages.length,
          size:
            c &&
            (c.center || c.autoWidth || c.dotsData ? 1 : c.dotsEach || c.items),
        };
      }),
      (e.prototype.current = function () {
        var b = this._core.relative(this._core.current());
        return a
          .grep(
            this._pages,
            a.proxy(function (a, c) {
              return a.start <= b && a.end >= b;
            }, this)
          )
          .pop();
      }),
      (e.prototype.getPosition = function (b) {
        var c,
          d,
          e = this._core.settings;
        return (
          "page" == e.slideBy
            ? ((c = a.inArray(this.current(), this._pages)),
              (d = this._pages.length),
              b ? ++c : --c,
              (c = this._pages[((c % d) + d) % d].start))
            : ((c = this._core.relative(this._core.current())),
              (d = this._core.items().length),
              b ? (c += e.slideBy) : (c -= e.slideBy)),
          c
        );
      }),
      (e.prototype.next = function (b) {
        a.proxy(this._overrides.to, this._core)(this.getPosition(!0), b);
      }),
      (e.prototype.prev = function (b) {
        a.proxy(this._overrides.to, this._core)(this.getPosition(!1), b);
      }),
      (e.prototype.to = function (b, c, d) {
        var e;
        !d && this._pages.length
          ? ((e = this._pages.length),
            a.proxy(this._overrides.to, this._core)(
              this._pages[((b % e) + e) % e].start,
              c
            ))
          : a.proxy(this._overrides.to, this._core)(b, c);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Navigation = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    "use strict";
    var e = function (c) {
      (this._core = c),
        (this._hashes = {}),
        (this.$element = this._core.$element),
        (this._handlers = {
          "initialized.owl.carousel": a.proxy(function (c) {
            c.namespace &&
              "URLHash" === this._core.settings.startPosition &&
              a(b).trigger("hashchange.owl.navigation");
          }, this),
          "prepared.owl.carousel": a.proxy(function (b) {
            if (b.namespace) {
              var c = a(b.content)
                .find("[data-hash]")
                .addBack("[data-hash]")
                .attr("data-hash");
              if (!c) return;
              this._hashes[c] = b.content;
            }
          }, this),
          "changed.owl.carousel": a.proxy(function (c) {
            if (c.namespace && "position" === c.property.name) {
              var d = this._core.items(
                  this._core.relative(this._core.current())
                ),
                e = a
                  .map(this._hashes, function (a, b) {
                    return a === d ? b : null;
                  })
                  .join();
              if (!e || b.location.hash.slice(1) === e) return;
              b.location.hash = e;
            }
          }, this),
        }),
        (this._core.options = a.extend({}, e.Defaults, this._core.options)),
        this.$element.on(this._handlers),
        a(b).on(
          "hashchange.owl.navigation",
          a.proxy(function (a) {
            var c = b.location.hash.substring(1),
              e = this._core.$stage.children(),
              f = this._hashes[c] && e.index(this._hashes[c]);
            f !== d &&
              f !== this._core.current() &&
              this._core.to(this._core.relative(f), !1, !0);
          }, this)
        );
    };
    (e.Defaults = { URLhashListener: !1 }),
      (e.prototype.destroy = function () {
        var c, d;
        a(b).off("hashchange.owl.navigation");
        for (c in this._handlers) this._core.$element.off(c, this._handlers[c]);
        for (d in Object.getOwnPropertyNames(this))
          "function" != typeof this[d] && (this[d] = null);
      }),
      (a.fn.owlCarousel.Constructor.Plugins.Hash = e);
  })(window.Zepto || window.jQuery, window, document),
  (function (a, b, c, d) {
    function e(b, c) {
      var e = !1,
        f = b.charAt(0).toUpperCase() + b.slice(1);
      return (
        a.each((b + " " + h.join(f + " ") + f).split(" "), function (a, b) {
          if (g[b] !== d) return (e = !c || b), !1;
        }),
        e
      );
    }
    function f(a) {
      return e(a, !0);
    }
    var g = a("<support>").get(0).style,
      h = "Webkit Moz O ms".split(" "),
      i = {
        transition: {
          end: {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd",
            transition: "transitionend",
          },
        },
        animation: {
          end: {
            WebkitAnimation: "webkitAnimationEnd",
            MozAnimation: "animationend",
            OAnimation: "oAnimationEnd",
            animation: "animationend",
          },
        },
      },
      j = {
        csstransforms: function () {
          return !!e("transform");
        },
        csstransforms3d: function () {
          return !!e("perspective");
        },
        csstransitions: function () {
          return !!e("transition");
        },
        cssanimations: function () {
          return !!e("animation");
        },
      };
    j.csstransitions() &&
      ((a.support.transition = new String(f("transition"))),
      (a.support.transition.end = i.transition.end[a.support.transition])),
      j.cssanimations() &&
        ((a.support.animation = new String(f("animation"))),
        (a.support.animation.end = i.animation.end[a.support.animation])),
      j.csstransforms() &&
        ((a.support.transform = new String(f("transform"))),
        (a.support.transform3d = j.csstransforms3d()));
  })(window.Zepto || window.jQuery, window, document);
/** Bootstrap Rating Js **/
// bootstrap-rating - v1.2.0 - (c) 2015 dreyescat
// https://github.com/dreyescat/bootstrap-rating MIT
!(function (a, b) {
  "use strict";
  function c(c, e) {
    (this.$input = a(c)),
      (this.$rating = a("<span></span>").insertBefore(this.$input)),
      (this.options = (function (c) {
        return (
          (c.start = parseInt(c.start, 10)),
          (c.start = isNaN(c.start) ? b : c.start),
          (c.stop = parseInt(c.stop, 10)),
          (c.stop = isNaN(c.stop) ? c.start + d || b : c.stop),
          (c.step = parseInt(c.step, 10) || b),
          (c.fractions = Math.abs(parseInt(c.fractions, 10)) || b),
          (c.scale = Math.abs(parseInt(c.scale, 10)) || b),
          (c = a.extend({}, a.fn.rating.defaults, c)),
          (c.filledSelected = c.filledSelected || c.filled),
          c
        );
      })(a.extend({}, this.$input.data(), e))),
      this._init();
  }
  var d = 5;
  (c.prototype = {
    _init: function () {
      for (
        var c = this,
          d = this.$input,
          e = this.$rating,
          f = function (a) {
            return function (b) {
              d.prop("disabled") || d.prop("readonly") || a.call(this, b);
            };
          },
          g = 1;
        g <= this._rateToIndex(this.options.stop);
        g++
      ) {
        var h = a('<div class="rating-symbol"></div>').css({
          display: "inline-block",
          position: "relative",
        });
        a(
          '<div class="rating-symbol-background ' +
            this.options.empty +
            '"></div>'
        ).appendTo(h),
          a('<div class="rating-symbol-foreground"></div>')
            .append("<span></span>")
            .css({
              display: "inline-block",
              position: "absolute",
              overflow: "hidden",
              left: 0,
              width: 0,
            })
            .appendTo(h),
          e.append(h),
          this.options.extendSymbol.call(h, this._indexToRate(g));
      }
      this._updateRate(d.val()),
        d.on("change", function () {
          c._updateRate(a(this).val());
        });
      var i,
        j = function (b) {
          var d = a(b.currentTarget),
            e = (b.pageX || b.originalEvent.touches[0].pageX) - d.offset().left;
          return (
            (e = e > 0 ? e : 0.1 * c.options.scale), d.index() + e / d.width()
          );
        };
      e.on(
        "mousedown touchstart",
        ".rating-symbol",
        f(function (a) {
          d.val(c._indexToRate(j(a))).change();
        })
      )
        .on(
          "mousemove touchmove",
          ".rating-symbol",
          f(function (d) {
            var e = c._roundToFraction(j(d));
            e !== i &&
              (i !== b && a(this).trigger("rating.rateleave"),
              (i = e),
              a(this).trigger("rating.rateenter", [c._indexToRate(i)])),
              c._fillUntil(e);
          })
        )
        .on(
          "mouseleave touchend",
          ".rating-symbol",
          f(function () {
            (i = b),
              a(this).trigger("rating.rateleave"),
              c._fillUntil(c._rateToIndex(parseFloat(d.val())));
          })
        );
    },
    _fillUntil: function (a) {
      var b = this.$rating,
        c = Math.floor(a);
      b.find(".rating-symbol-background")
        .css("visibility", "visible")
        .slice(0, c)
        .css("visibility", "hidden");
      var d = b.find(".rating-symbol-foreground");
      d.width(0),
        d
          .slice(0, c)
          .width("auto")
          .find("span")
          .attr("class", this.options.filled),
        d
          .eq(a % 1 ? c : c - 1)
          .find("span")
          .attr("class", this.options.filledSelected),
        d.eq(c).width((a % 1) * 100 + "%");
    },
    _indexToRate: function (a) {
      return (
        this.options.start +
        Math.floor(a) * this.options.step +
        this.options.step * this._roundToFraction(a % 1)
      );
    },
    _rateToIndex: function (a) {
      return (a - this.options.start) / this.options.step;
    },
    _roundToFraction: function (a) {
      var b =
          Math.ceil((a % 1) * this.options.fractions) / this.options.fractions,
        c = Math.pow(10, this.options.scale);
      return Math.floor(a) + Math.floor(b * c) / c;
    },
    _contains: function (a) {
      var b = this.options.step > 0 ? this.options.start : this.options.stop,
        c = this.options.step > 0 ? this.options.stop : this.options.start;
      return a >= b && c >= a;
    },
    _updateRate: function (a) {
      var b = parseFloat(a);
      this._contains(b) &&
        (this._fillUntil(this._rateToIndex(b)), this.$input.val(b));
    },
    rate: function (a) {
      return a === b ? this.$input.val() : void this._updateRate(a);
    },
  }),
    (a.fn.rating = function (b) {
      var d,
        e = Array.prototype.slice.call(arguments, 1);
      return (
        this.each(function () {
          var f = a(this),
            g = f.data("rating");
          g || f.data("rating", (g = new c(this, b))),
            "string" == typeof b && "_" !== b[0] && (d = g[b].apply(g, e));
        }),
        d || this
      );
    }),
    (a.fn.rating.defaults = {
      filled: "glyphicon glyphicon-star",
      filledSelected: b,
      empty: "glyphicon glyphicon-star-empty",
      start: 0,
      stop: d,
      step: 1,
      fractions: 1,
      scale: 3,
      extendSymbol: function () {},
    }),
    a(function () {
      a("input.rating").rating();
    });
})(jQuery);

/*
 jQuery appear plugin
 */
!(function (e) {
  function r() {
    n = !1;
    for (var r = 0, a = i.length; a > r; r++) {
      var o = e(i[r]).filter(function () {
        return e(this).is(":appeared");
      });
      if ((o.trigger("appear", [o]), t)) {
        var f = t.not(o);
        f.trigger("disappear", [f]);
      }
      t = o;
    }
  }
  var t,
    i = [],
    a = !1,
    n = !1,
    o = { interval: 250, force_process: !1 },
    f = e(window);
  (e.expr[":"].appeared = function (r) {
    var t = e(r);
    if (!t.is(":visible")) return !1;
    var i = f.scrollLeft(),
      a = f.scrollTop(),
      n = t.offset(),
      o = n.left,
      p = n.top;
    return p + t.height() >= a &&
      p - (t.data("appear-top-offset") || 0) <= a + f.height() &&
      o + t.width() >= i &&
      o - (t.data("appear-left-offset") || 0) <= i + f.width()
      ? !0
      : !1;
  }),
    e.fn.extend({
      appear: function (t) {
        var f = e.extend({}, o, t || {}),
          p = this.selector || this;
        if (!a) {
          var s = function () {
            n || ((n = !0), setTimeout(r, f.interval));
          };
          e(window).scroll(s).resize(s), (a = !0);
        }
        return f.force_process && setTimeout(r, f.interval), i.push(p), e(p);
      },
    }),
    e.extend({
      force_appear: function () {
        return a ? (r(), !0) : !1;
      },
    });
})(jQuery);
/*
 jQuery animateNumber plugin
 */
!(function (e) {
  var t = function (e) {
      return e.split("").reverse().join("");
    },
    n = {
      numberStep: function (t, n) {
        var r = Math.floor(t),
          a = e(n.elem);
        a.text(r);
      },
    },
    r = function (e) {
      var t = e.elem;
      if (t.nodeType && t.parentNode) {
        var r = t._animateNumberSetter;
        r || (r = n.numberStep), r(e.now, e);
      }
    };
  e.Tween && e.Tween.propHooks
    ? (e.Tween.propHooks.number = { set: r })
    : (e.fx.step.number = r);
  var a = function (e, t) {
      for (
        var n,
          r,
          a,
          o = e.split("").reverse(),
          u = [],
          i = 0,
          m = Math.ceil(e.length / t);
        m > i;
        i++
      ) {
        for (n = "", a = 0; t > a && ((r = i * t + a), r !== e.length); a++)
          n += o[r];
        u.push(n);
      }
      return u;
    },
    o = function (e) {
      var n = e.length - 1,
        r = t(e[n]);
      return (e[n] = t(parseInt(r, 10).toString())), e;
    };
  (e.animateNumber = {
    numberStepFactories: {
      append: function (t) {
        return function (n, r) {
          var a = Math.floor(n),
            o = e(r.elem);
          o.prop("number", n).text(a + t);
        };
      },
      separator: function (n, r) {
        return (
          (n = n || " "),
          (r = r || 3),
          function (u, i) {
            var m = Math.floor(u),
              p = m.toString(),
              f = e(i.elem);
            if (p.length > r) {
              var s = a(p, r);
              (p = o(s).join(n)), (p = t(p));
            }
            f.prop("number", u).text(p);
          }
        );
      },
    },
  }),
    (e.fn.animateNumber = function () {
      for (
        var t = arguments[0],
          r = e.extend({}, n, t),
          a = e(this),
          o = [r],
          u = 1,
          i = arguments.length;
        i > u;
        u++
      )
        o.push(arguments[u]);
      if (t.numberStep) {
        var m = this.each(function () {
            this._animateNumberSetter = t.numberStep;
          }),
          p = r.complete;
        r.complete = function () {
          m.each(function () {
            delete this._animateNumberSetter;
          }),
            p && p.apply(this, arguments);
        };
      }
      return a.animate.apply(a, o);
    });
})(jQuery);

/*! simpleWeather v3.1.0 - http://simpleweatherjs.com */
/*! simpleWeather v3.1.0 - http://simpleweatherjs.com */
!(function (t) {
  "use strict";
  function e(t, e) {
    return "f" === t
      ? Math.round((5 / 9) * (e - 32))
      : Math.round(1.8 * e + 32);
  }
  t.extend({
    simpleWeather: function (i) {
      i = t.extend(
        {
          location: "",
          woeid: "",
          unit: "f",
          success: function (t) {},
          error: function (t) {},
        },
        i
      );
      var o = new Date(),
        n =
          "https://query.yahooapis.com/v1/public/yql?format=json&rnd=" +
          o.getFullYear() +
          o.getMonth() +
          o.getDay() +
          o.getHours() +
          "&diagnostics=true&callback=?&q=";
      if ("" !== i.location) {
        var r = "";
        (r = /^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/.test(i.location)
          ? "(" + i.location + ")"
          : i.location),
          (n +=
            'select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' +
            r +
            '") and u="' +
            i.unit +
            '"');
      } else {
        if ("" === i.woeid)
          return (
            i.error("Could not retrieve weather due to an invalid location."),
            !1
          );
        n +=
          "select * from weather.forecast where woeid=" +
          i.woeid +
          ' and u="' +
          i.unit +
          '"';
      }
      return (
        t.getJSON(encodeURI(n), function (t) {
          if (
            null !== t &&
            null !== t.query &&
            null !== t.query.results &&
            "Yahoo! Weather Error" !== t.query.results.channel.description
          ) {
            var o,
              n = t.query.results.channel,
              r = {},
              s = [
                "N",
                "NNE",
                "NE",
                "ENE",
                "E",
                "ESE",
                "SE",
                "SSE",
                "S",
                "SSW",
                "SW",
                "WSW",
                "W",
                "WNW",
                "NW",
                "NNW",
                "N",
              ],
              a =
                "https://s.yimg.com/os/mit/media/m/weather/images/icons/l/44d-100567.png";
            (r.title = n.item.title),
              (r.temp = n.item.condition.temp),
              (r.code = n.item.condition.code),
              (r.todayCode = n.item.forecast[0].code),
              (r.currently = n.item.condition.text),
              (r.high = n.item.forecast[0].high),
              (r.low = n.item.forecast[0].low),
              (r.text = n.item.forecast[0].text),
              (r.humidity = n.atmosphere.humidity),
              (r.pressure = n.atmosphere.pressure),
              (r.rising = n.atmosphere.rising),
              (r.visibility = n.atmosphere.visibility),
              (r.sunrise = n.astronomy.sunrise),
              (r.sunset = n.astronomy.sunset),
              (r.description = n.item.description),
              (r.city = n.location.city),
              (r.country = n.location.country),
              (r.region = n.location.region),
              (r.updated = n.item.pubDate),
              (r.link = n.item.link),
              (r.units = {
                temp: n.units.temperature,
                distance: n.units.distance,
                pressure: n.units.pressure,
                speed: n.units.speed,
              }),
              (r.wind = {
                chill: n.wind.chill,
                direction: s[Math.round(n.wind.direction / 22.5)],
                speed: n.wind.speed,
              }),
              n.item.condition.temp < 80 && n.atmosphere.humidity < 40
                ? (r.heatindex =
                    -42.379 +
                    2.04901523 * n.item.condition.temp +
                    10.14333127 * n.atmosphere.humidity -
                    0.22475541 * n.item.condition.temp * n.atmosphere.humidity -
                    6.83783 *
                      Math.pow(10, -3) *
                      Math.pow(n.item.condition.temp, 2) -
                    5.481717 *
                      Math.pow(10, -2) *
                      Math.pow(n.atmosphere.humidity, 2) +
                    1.22874 *
                      Math.pow(10, -3) *
                      Math.pow(n.item.condition.temp, 2) *
                      n.atmosphere.humidity +
                    8.5282 *
                      Math.pow(10, -4) *
                      n.item.condition.temp *
                      Math.pow(n.atmosphere.humidity, 2) -
                    1.99 *
                      Math.pow(10, -6) *
                      Math.pow(n.item.condition.temp, 2) *
                      Math.pow(n.atmosphere.humidity, 2))
                : (r.heatindex = n.item.condition.temp),
              "3200" == n.item.condition.code
                ? ((r.thumbnail = a), (r.image = a))
                : ((r.thumbnail =
                    "https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/" +
                    n.item.condition.code +
                    "ds.png"),
                  (r.image =
                    "https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/" +
                    n.item.condition.code +
                    "d.png")),
              (r.alt = {
                temp: e(i.unit, n.item.condition.temp),
                high: e(i.unit, n.item.forecast[0].high),
                low: e(i.unit, n.item.forecast[0].low),
              }),
              "f" === i.unit ? (r.alt.unit = "c") : (r.alt.unit = "f"),
              (r.forecast = []);
            for (var m = 0; m < n.item.forecast.length; m++)
              (o = n.item.forecast[m]),
                (o.alt = {
                  high: e(i.unit, n.item.forecast[m].high),
                  low: e(i.unit, n.item.forecast[m].low),
                }),
                "3200" == n.item.forecast[m].code
                  ? ((o.thumbnail = a), (o.image = a))
                  : ((o.thumbnail =
                      "https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/" +
                      n.item.forecast[m].code +
                      "ds.png"),
                    (o.image =
                      "https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/" +
                      n.item.forecast[m].code +
                      "d.png")),
                r.forecast.push(o);
            i.success(r);
          } else i.error("There was a problem retrieving the latest weather information.");
        }),
        this
      );
    },
  });
})(jQuery);

!(function (t) {
  "use strict";
  var s = {
      slide: 0,
      delay: 5e3,
      loop: !0,
      preload: !1,
      preloadImage: !1,
      preloadVideo: !1,
      timer: !0,
      overlay: !1,
      autoplay: !0,
      shuffle: !1,
      cover: !0,
      color: null,
      align: "center",
      valign: "center",
      firstTransition: null,
      firstTransitionDuration: null,
      transition: "fade",
      transitionDuration: 1e3,
      transitionRegister: [],
      animation: null,
      animationDuration: "auto",
      animationRegister: [],
      slidesToKeep: 1,
      init: function () {},
      play: function () {},
      pause: function () {},
      walk: function () {},
      slides: [],
    },
    i = {},
    e = function (i, e) {
      (this.elmt = i),
        (this.settings = t.extend({}, s, t.vegas.defaults, e)),
        (this.slide = this.settings.slide),
        (this.total = this.settings.slides.length),
        (this.noshow = this.total < 2),
        (this.paused = !this.settings.autoplay || this.noshow),
        (this.ended = !1),
        (this.$elmt = t(i)),
        (this.$timer = null),
        (this.$overlay = null),
        (this.$slide = null),
        (this.timeout = null),
        (this.first = !0),
        (this.transitions = [
          "fade",
          "fade2",
          "blur",
          "blur2",
          "flash",
          "flash2",
          "negative",
          "negative2",
          "burn",
          "burn2",
          "slideLeft",
          "slideLeft2",
          "slideRight",
          "slideRight2",
          "slideUp",
          "slideUp2",
          "slideDown",
          "slideDown2",
          "zoomIn",
          "zoomIn2",
          "zoomOut",
          "zoomOut2",
          "swirlLeft",
          "swirlLeft2",
          "swirlRight",
          "swirlRight2",
        ]),
        (this.animations = [
          "kenburns",
          "kenburnsLeft",
          "kenburnsRight",
          "kenburnsUp",
          "kenburnsUpLeft",
          "kenburnsUpRight",
          "kenburnsDown",
          "kenburnsDownLeft",
          "kenburnsDownRight",
        ]),
        this.settings.transitionRegister instanceof Array == !1 &&
          (this.settings.transitionRegister = [
            this.settings.transitionRegister,
          ]),
        this.settings.animationRegister instanceof Array == !1 &&
          (this.settings.animationRegister = [this.settings.animationRegister]),
        (this.transitions = this.transitions.concat(
          this.settings.transitionRegister
        )),
        (this.animations = this.animations.concat(
          this.settings.animationRegister
        )),
        (this.support = {
          objectFit: "objectFit" in document.body.style,
          transition:
            "transition" in document.body.style ||
            "WebkitTransition" in document.body.style,
          video: t.vegas.isVideoCompatible(),
        }),
        this.settings.shuffle === !0 && this.shuffle(),
        this._init();
    };
  (e.prototype = {
    _init: function () {
      var s,
        i,
        e,
        n = "BODY" === this.elmt.tagName,
        o = this.settings.timer,
        a = this.settings.overlay,
        r = this;
      this._preload(),
        n ||
          (this.$elmt.css("height", this.$elmt.css("height")),
          (s = t('<div class="vegas-wrapper">')
            .css("overflow", this.$elmt.css("overflow"))
            .css("padding", this.$elmt.css("padding"))),
          this.$elmt.css("padding") ||
            s
              .css("padding-top", this.$elmt.css("padding-top"))
              .css("padding-bottom", this.$elmt.css("padding-bottom"))
              .css("padding-left", this.$elmt.css("padding-left"))
              .css("padding-right", this.$elmt.css("padding-right")),
          this.$elmt.clone(!0).children().appendTo(s),
          (this.elmt.innerHTML = "")),
        o &&
          this.support.transition &&
          ((e = t(
            '<div class="vegas-timer"><div class="vegas-timer-progress">'
          )),
          (this.$timer = e),
          this.$elmt.prepend(e)),
        a &&
          ((i = t('<div class="vegas-overlay">')),
          "string" == typeof a && i.css("background-image", "url(" + a + ")"),
          (this.$overlay = i),
          this.$elmt.prepend(i)),
        this.$elmt.addClass("vegas-container"),
        n || this.$elmt.append(s),
        setTimeout(function () {
          r.trigger("init"),
            r._goto(r.slide),
            r.settings.autoplay && r.trigger("play");
        }, 1);
    },
    _preload: function () {
      var t, s;
      for (s = 0; s < this.settings.slides.length; s++)
        (this.settings.preload || this.settings.preloadImages) &&
          this.settings.slides[s].src &&
          ((t = new Image()), (t.src = this.settings.slides[s].src)),
          (this.settings.preload || this.settings.preloadVideos) &&
            this.support.video &&
            this.settings.slides[s].video &&
            (this.settings.slides[s].video instanceof Array
              ? this._video(this.settings.slides[s].video)
              : this._video(this.settings.slides[s].video.src));
    },
    _random: function (t) {
      return t[Math.floor(Math.random() * t.length)];
    },
    _slideShow: function () {
      var t = this;
      this.total > 1 &&
        !this.ended &&
        !this.paused &&
        !this.noshow &&
        (this.timeout = setTimeout(function () {
          t.next();
        }, this._options("delay")));
    },
    _timer: function (t) {
      var s = this;
      clearTimeout(this.timeout),
        this.$timer &&
          (this.$timer
            .removeClass("vegas-timer-running")
            .find("div")
            .css("transition-duration", "0ms"),
          this.ended ||
            this.paused ||
            this.noshow ||
            (t &&
              setTimeout(function () {
                s.$timer
                  .addClass("vegas-timer-running")
                  .find("div")
                  .css("transition-duration", s._options("delay") - 100 + "ms");
              }, 100)));
    },
    _video: function (t) {
      var s,
        e,
        n = t.toString();
      return i[n]
        ? i[n]
        : (t instanceof Array == !1 && (t = [t]),
          (s = document.createElement("video")),
          (s.preload = !0),
          t.forEach(function (t) {
            (e = document.createElement("source")),
              (e.src = t),
              s.appendChild(e);
          }),
          (i[n] = s),
          s);
    },
    _fadeOutSound: function (t, s) {
      var i = this,
        e = s / 10,
        n = t.volume - 0.09;
      n > 0
        ? ((t.volume = n),
          setTimeout(function () {
            i._fadeOutSound(t, s);
          }, e))
        : t.pause();
    },
    _fadeInSound: function (t, s) {
      var i = this,
        e = s / 10,
        n = t.volume + 0.09;
      n < 1 &&
        ((t.volume = n),
        setTimeout(function () {
          i._fadeInSound(t, s);
        }, e));
    },
    _options: function (t, s) {
      return (
        void 0 === s && (s = this.slide),
        void 0 !== this.settings.slides[s][t]
          ? this.settings.slides[s][t]
          : this.settings[t]
      );
    },
    _goto: function (s) {
      function i() {
        f._timer(!0),
          setTimeout(function () {
            y &&
              (f.support.transition
                ? (h
                    .css("transition", "all " + _ + "ms")
                    .addClass("vegas-transition-" + y + "-out"),
                  h.each(function () {
                    var t = h.find("video").get(0);
                    t && ((t.volume = 1), f._fadeOutSound(t, _));
                  }),
                  e
                    .css("transition", "all " + _ + "ms")
                    .addClass("vegas-transition-" + y + "-in"))
                : e.fadeIn(_));
            for (var t = 0; t < h.length - f.settings.slidesToKeep; t++)
              h.eq(t).remove();
            f.trigger("walk"), f._slideShow();
          }, 100);
      }
      "undefined" == typeof this.settings.slides[s] && (s = 0),
        (this.slide = s);
      var e,
        n,
        o,
        a,
        r,
        h = this.$elmt.children(".vegas-slide"),
        d = this.settings.slides[s].src,
        l = this.settings.slides[s].video,
        g = this._options("delay"),
        u = this._options("align"),
        c = this._options("valign"),
        p = this._options("cover"),
        m = this._options("color") || this.$elmt.css("background-color"),
        f = this,
        v = h.length,
        y = this._options("transition"),
        _ = this._options("transitionDuration"),
        w = this._options("animation"),
        b = this._options("animationDuration");
      this.settings.firstTransition &&
        this.first &&
        (y = this.settings.firstTransition || y),
        this.settings.firstTransitionDuration &&
          this.first &&
          (_ = this.settings.firstTransitionDuration || _),
        this.first && (this.first = !1),
        "repeat" !== p &&
          (p === !0 ? (p = "cover") : p === !1 && (p = "contain")),
        ("random" === y || y instanceof Array) &&
          (y =
            y instanceof Array
              ? this._random(y)
              : this._random(this.transitions)),
        ("random" === w || w instanceof Array) &&
          (w =
            w instanceof Array
              ? this._random(w)
              : this._random(this.animations)),
        ("auto" === _ || _ > g) && (_ = g),
        "auto" === b && (b = g),
        (e = t('<div class="vegas-slide"></div>')),
        this.support.transition && y && e.addClass("vegas-transition-" + y),
        this.support.video && l
          ? ((a = l instanceof Array ? this._video(l) : this._video(l.src)),
            (a.loop = void 0 === l.loop || l.loop),
            (a.muted = void 0 === l.mute || l.mute),
            a.muted === !1
              ? ((a.volume = 0), this._fadeInSound(a, _))
              : a.pause(),
            (o = t(a).addClass("vegas-video").css("background-color", m)),
            this.support.objectFit
              ? o
                  .css("object-position", u + " " + c)
                  .css("object-fit", p)
                  .css("width", "100%")
                  .css("height", "100%")
              : "contain" === p && o.css("width", "100%").css("height", "100%"),
            e.append(o))
          : ((r = new Image()),
            (n = t('<div class="vegas-slide-inner"></div>')
              .css("background-image", 'url("' + d + '")')
              .css("background-color", m)
              .css("background-position", u + " " + c)),
            "repeat" === p
              ? n.css("background-repeat", "repeat")
              : n.css("background-size", p),
            this.support.transition &&
              w &&
              n
                .addClass("vegas-animation-" + w)
                .css("animation-duration", b + "ms"),
            e.append(n)),
        this.support.transition || e.css("display", "none"),
        v ? h.eq(v - 1).after(e) : this.$elmt.prepend(e),
        h.css("transition", "all 0ms").each(function () {
          (this.className = "vegas-slide"),
            "VIDEO" === this.tagName && (this.className += " vegas-video"),
            y &&
              ((this.className += " vegas-transition-" + y),
              (this.className += " vegas-transition-" + y + "-in"));
        }),
        f._timer(!1),
        a
          ? (4 === a.readyState && (a.currentTime = 0), a.play(), i())
          : ((r.src = d), r.complete ? i() : (r.onload = i));
    },
    _end: function () {
      (this.ended = !0), this._timer(!1), this.trigger("end");
    },
    shuffle: function () {
      for (var t, s, i = this.total - 1; i > 0; i--)
        (s = Math.floor(Math.random() * (i + 1))),
          (t = this.settings.slides[i]),
          (this.settings.slides[i] = this.settings.slides[s]),
          (this.settings.slides[s] = t);
    },
    play: function () {
      this.paused && ((this.paused = !1), this.next(), this.trigger("play"));
    },
    pause: function () {
      this._timer(!1), (this.paused = !0), this.trigger("pause");
    },
    toggle: function () {
      this.paused ? this.play() : this.pause();
    },
    playing: function () {
      return !this.paused && !this.noshow;
    },
    current: function (t) {
      return t
        ? { slide: this.slide, data: this.settings.slides[this.slide] }
        : this.slide;
    },
    jump: function (t) {
      t < 0 ||
        t > this.total - 1 ||
        t === this.slide ||
        ((this.slide = t), this._goto(this.slide));
    },
    next: function () {
      if ((this.slide++, this.slide >= this.total)) {
        if (!this.settings.loop) return this._end();
        this.slide = 0;
      }
      this._goto(this.slide);
    },
    previous: function () {
      if ((this.slide--, this.slide < 0)) {
        if (!this.settings.loop) return void this.slide++;
        this.slide = this.total - 1;
      }
      this._goto(this.slide);
    },
    trigger: function (t) {
      var s = [];
      (s =
        "init" === t
          ? [this.settings]
          : [this.slide, this.settings.slides[this.slide]]),
        this.$elmt.trigger("vegas" + t, s),
        "function" == typeof this.settings[t] &&
          this.settings[t].apply(this.$elmt, s);
    },
    options: function (i, e) {
      var n = this.settings.slides.slice();
      if ("object" == typeof i)
        this.settings = t.extend({}, s, t.vegas.defaults, i);
      else {
        if ("string" != typeof i) return this.settings;
        if (void 0 === e) return this.settings[i];
        this.settings[i] = e;
      }
      this.settings.slides !== n &&
        ((this.total = this.settings.slides.length),
        (this.noshow = this.total < 2),
        this._preload());
    },
    destroy: function () {
      clearTimeout(this.timeout),
        this.$elmt.removeClass("vegas-container"),
        this.$elmt.find("> .vegas-slide").remove(),
        this.$elmt
          .find("> .vegas-wrapper")
          .clone(!0)
          .children()
          .appendTo(this.$elmt),
        this.$elmt.find("> .vegas-wrapper").remove(),
        this.settings.timer && this.$timer.remove(),
        this.settings.overlay && this.$overlay.remove(),
        (this.elmt._vegas = null);
    },
  }),
    (t.fn.vegas = function (t) {
      var s,
        i = arguments,
        n = !1;
      if (void 0 === t || "object" == typeof t)
        return this.each(function () {
          this._vegas || (this._vegas = new e(this, t));
        });
      if ("string" == typeof t) {
        if (
          (this.each(function () {
            var e = this._vegas;
            if (!e) throw new Error("No Vegas applied to this element.");
            "function" == typeof e[t] && "_" !== t[0]
              ? (s = e[t].apply(e, [].slice.call(i, 1)))
              : (n = !0);
          }),
          n)
        )
          throw new Error('No method "' + t + '" in Vegas.');
        return void 0 !== s ? s : this;
      }
    }),
    (t.vegas = {}),
    (t.vegas.defaults = s),
    (t.vegas.isVideoCompatible = function () {
      return !/(Android|webOS|Phone|iPad|iPod|BlackBerry|Windows Phone)/i.test(
        navigator.userAgent
      );
    });
})(window.jQuery || window.Zepto);
/*
 * jQuery Easing v1.3 -
 */
jQuery.easing.jswing = jQuery.easing.swing;
jQuery.extend(jQuery.easing, {
  def: "easeOutQuad",
  swing: function (e, f, a, h, g) {
    return jQuery.easing[jQuery.easing.def](e, f, a, h, g);
  },
  easeInQuad: function (e, f, a, h, g) {
    return h * (f /= g) * f + a;
  },
  easeOutQuad: function (e, f, a, h, g) {
    return -h * (f /= g) * (f - 2) + a;
  },
  easeInOutQuad: function (e, f, a, h, g) {
    if ((f /= g / 2) < 1) {
      return (h / 2) * f * f + a;
    }
    return (-h / 2) * (--f * (f - 2) - 1) + a;
  },
  easeInCubic: function (e, f, a, h, g) {
    return h * (f /= g) * f * f + a;
  },
  easeOutCubic: function (e, f, a, h, g) {
    return h * ((f = f / g - 1) * f * f + 1) + a;
  },
  easeInOutCubic: function (e, f, a, h, g) {
    if ((f /= g / 2) < 1) {
      return (h / 2) * f * f * f + a;
    }
    return (h / 2) * ((f -= 2) * f * f + 2) + a;
  },
  easeInQuart: function (e, f, a, h, g) {
    return h * (f /= g) * f * f * f + a;
  },
  easeOutQuart: function (e, f, a, h, g) {
    return -h * ((f = f / g - 1) * f * f * f - 1) + a;
  },
  easeInOutQuart: function (e, f, a, h, g) {
    if ((f /= g / 2) < 1) {
      return (h / 2) * f * f * f * f + a;
    }
    return (-h / 2) * ((f -= 2) * f * f * f - 2) + a;
  },
  easeInQuint: function (e, f, a, h, g) {
    return h * (f /= g) * f * f * f * f + a;
  },
  easeOutQuint: function (e, f, a, h, g) {
    return h * ((f = f / g - 1) * f * f * f * f + 1) + a;
  },
  easeInOutQuint: function (e, f, a, h, g) {
    if ((f /= g / 2) < 1) {
      return (h / 2) * f * f * f * f * f + a;
    }
    return (h / 2) * ((f -= 2) * f * f * f * f + 2) + a;
  },
  easeInSine: function (e, f, a, h, g) {
    return -h * Math.cos((f / g) * (Math.PI / 2)) + h + a;
  },
  easeOutSine: function (e, f, a, h, g) {
    return h * Math.sin((f / g) * (Math.PI / 2)) + a;
  },
  easeInOutSine: function (e, f, a, h, g) {
    return (-h / 2) * (Math.cos((Math.PI * f) / g) - 1) + a;
  },
  easeInExpo: function (e, f, a, h, g) {
    return f == 0 ? a : h * Math.pow(2, 10 * (f / g - 1)) + a;
  },
  easeOutExpo: function (e, f, a, h, g) {
    return f == g ? a + h : h * (-Math.pow(2, (-10 * f) / g) + 1) + a;
  },
  easeInOutExpo: function (e, f, a, h, g) {
    if (f == 0) {
      return a;
    }
    if (f == g) {
      return a + h;
    }
    if ((f /= g / 2) < 1) {
      return (h / 2) * Math.pow(2, 10 * (f - 1)) + a;
    }
    return (h / 2) * (-Math.pow(2, -10 * --f) + 2) + a;
  },
  easeInCirc: function (e, f, a, h, g) {
    return -h * (Math.sqrt(1 - (f /= g) * f) - 1) + a;
  },
  easeOutCirc: function (e, f, a, h, g) {
    return h * Math.sqrt(1 - (f = f / g - 1) * f) + a;
  },
  easeInOutCirc: function (e, f, a, h, g) {
    if ((f /= g / 2) < 1) {
      return (-h / 2) * (Math.sqrt(1 - f * f) - 1) + a;
    }
    return (h / 2) * (Math.sqrt(1 - (f -= 2) * f) + 1) + a;
  },
  easeInElastic: function (f, h, e, l, k) {
    var i = 1.70158;
    var j = 0;
    var g = l;
    if (h == 0) {
      return e;
    }
    if ((h /= k) == 1) {
      return e + l;
    }
    if (!j) {
      j = k * 0.3;
    }
    if (g < Math.abs(l)) {
      g = l;
      var i = j / 4;
    } else {
      var i = (j / (2 * Math.PI)) * Math.asin(l / g);
    }
    return (
      -(
        g *
        Math.pow(2, 10 * (h -= 1)) *
        Math.sin(((h * k - i) * (2 * Math.PI)) / j)
      ) + e
    );
  },
  easeOutElastic: function (f, h, e, l, k) {
    var i = 1.70158;
    var j = 0;
    var g = l;
    if (h == 0) {
      return e;
    }
    if ((h /= k) == 1) {
      return e + l;
    }
    if (!j) {
      j = k * 0.3;
    }
    if (g < Math.abs(l)) {
      g = l;
      var i = j / 4;
    } else {
      var i = (j / (2 * Math.PI)) * Math.asin(l / g);
    }
    return (
      g * Math.pow(2, -10 * h) * Math.sin(((h * k - i) * (2 * Math.PI)) / j) +
      l +
      e
    );
  },
  easeInOutElastic: function (f, h, e, l, k) {
    var i = 1.70158;
    var j = 0;
    var g = l;
    if (h == 0) {
      return e;
    }
    if ((h /= k / 2) == 2) {
      return e + l;
    }
    if (!j) {
      j = k * (0.3 * 1.5);
    }
    if (g < Math.abs(l)) {
      g = l;
      var i = j / 4;
    } else {
      var i = (j / (2 * Math.PI)) * Math.asin(l / g);
    }
    if (h < 1) {
      return (
        -0.5 *
          (g *
            Math.pow(2, 10 * (h -= 1)) *
            Math.sin(((h * k - i) * (2 * Math.PI)) / j)) +
        e
      );
    }
    return (
      g *
        Math.pow(2, -10 * (h -= 1)) *
        Math.sin(((h * k - i) * (2 * Math.PI)) / j) *
        0.5 +
      l +
      e
    );
  },
  easeInBack: function (e, f, a, i, h, g) {
    if (g == undefined) {
      g = 1.70158;
    }
    return i * (f /= h) * f * ((g + 1) * f - g) + a;
  },
  easeOutBack: function (e, f, a, i, h, g) {
    if (g == undefined) {
      g = 1.70158;
    }
    return i * ((f = f / h - 1) * f * ((g + 1) * f + g) + 1) + a;
  },
  easeInOutBack: function (e, f, a, i, h, g) {
    if (g == undefined) {
      g = 1.70158;
    }
    if ((f /= h / 2) < 1) {
      return (i / 2) * (f * f * (((g *= 1.525) + 1) * f - g)) + a;
    }
    return (i / 2) * ((f -= 2) * f * (((g *= 1.525) + 1) * f + g) + 2) + a;
  },
  easeInBounce: function (e, f, a, h, g) {
    return h - jQuery.easing.easeOutBounce(e, g - f, 0, h, g) + a;
  },
  easeOutBounce: function (e, f, a, h, g) {
    if ((f /= g) < 1 / 2.75) {
      return h * (7.5625 * f * f) + a;
    } else {
      if (f < 2 / 2.75) {
        return h * (7.5625 * (f -= 1.5 / 2.75) * f + 0.75) + a;
      } else {
        if (f < 2.5 / 2.75) {
          return h * (7.5625 * (f -= 2.25 / 2.75) * f + 0.9375) + a;
        } else {
          return h * (7.5625 * (f -= 2.625 / 2.75) * f + 0.984375) + a;
        }
      }
    }
  },
  easeInOutBounce: function (e, f, a, h, g) {
    if (f < g / 2) {
      return jQuery.easing.easeInBounce(e, f * 2, 0, h, g) * 0.5 + a;
    }
    return (
      jQuery.easing.easeOutBounce(e, f * 2 - g, 0, h, g) * 0.5 + h * 0.5 + a
    );
  },
});
/*! Swipebox v1.4.4 | Constantin Saguin csag.co | MIT License | github.com/brutaldesign/swipebox */
!(function (a, b, c, d) {
  (c.swipebox = function (e, f) {
    var g,
      h,
      i = {
        useCSS: !0,
        useSVG: !0,
        initialIndexOnArray: 0,
        removeBarsOnMobile: !0,
        hideCloseButtonOnMobile: !1,
        hideBarsDelay: 3e3,
        videoMaxWidth: 1140,
        vimeoColor: "cccccc",
        beforeOpen: null,
        afterOpen: null,
        afterClose: null,
        afterMedia: null,
        nextSlide: null,
        prevSlide: null,
        loopAtEnd: !1,
        autoplayVideos: !1,
        queryStringData: {},
        toggleClassOnLoad: "",
      },
      j = this,
      k = [],
      l = e.selector,
      m = navigator.userAgent.match(
        /(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i
      ),
      n =
        null !== m ||
        b.createTouch !== d ||
        "ontouchstart" in a ||
        "onmsgesturechange" in a ||
        navigator.msMaxTouchPoints,
      o =
        !!b.createElementNS &&
        !!b.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect,
      p = a.innerWidth ? a.innerWidth : c(a).width(),
      q = a.innerHeight ? a.innerHeight : c(a).height(),
      r = 0,
      s =
        '<div id="swipebox-overlay">					<div id="swipebox-container">						<div id="swipebox-slider"></div>						<div id="swipebox-top-bar">							<div id="swipebox-title"></div>						</div>						<div id="swipebox-bottom-bar">							<div id="swipebox-arrows">								<a id="swipebox-prev"></a>								<a id="swipebox-next"></a>							</div>						</div>						<a id="swipebox-close"></a>					</div>			</div>';
    (j.settings = {}),
      (c.swipebox.close = function () {
        g.closeSlide();
      }),
      (c.swipebox.extend = function () {
        return g;
      }),
      (j.init = function () {
        (j.settings = c.extend({}, i, f)),
          c.isArray(e)
            ? ((k = e),
              (g.target = c(a)),
              g.init(j.settings.initialIndexOnArray))
            : c(b).on("click", l, function (a) {
                if ("slide current" === a.target.parentNode.className)
                  return !1;
                c.isArray(e) || (g.destroy(), (h = c(l)), g.actions()),
                  (k = []);
                var b, d, f;
                f || ((d = "data-rel"), (f = c(this).attr(d))),
                  f || ((d = "rel"), (f = c(this).attr(d))),
                  (h =
                    f && "" !== f && "nofollow" !== f
                      ? c(l).filter("[" + d + '="' + f + '"]')
                      : c(l)),
                  h.each(function () {
                    var a = null,
                      b = null;
                    c(this).attr("title") && (a = c(this).attr("title")),
                      c(this).attr("href") && (b = c(this).attr("href")),
                      k.push({ href: b, title: a });
                  }),
                  (b = h.index(c(this))),
                  a.preventDefault(),
                  a.stopPropagation(),
                  (g.target = c(a.target)),
                  g.init(b);
              });
      }),
      (g = {
        init: function (a) {
          j.settings.beforeOpen && j.settings.beforeOpen(),
            this.target.trigger("swipebox-start"),
            (c.swipebox.isOpen = !0),
            this.build(),
            this.openSlide(a),
            this.openMedia(a),
            this.preloadMedia(a + 1),
            this.preloadMedia(a - 1),
            j.settings.afterOpen && j.settings.afterOpen(a);
        },
        build: function () {
          var a,
            b = this;
          c("body").append(s),
            o &&
              j.settings.useSVG === !0 &&
              ((a = c("#swipebox-close").css("background-image")),
              (a = a.replace("png", "svg")),
              c("#swipebox-prev, #swipebox-next, #swipebox-close").css({
                "background-image": a,
              })),
            m &&
              j.settings.removeBarsOnMobile &&
              c("#swipebox-bottom-bar, #swipebox-top-bar").remove(),
            c.each(k, function () {
              c("#swipebox-slider").append('<div class="slide"></div>');
            }),
            b.setDim(),
            b.actions(),
            n && b.gesture(),
            b.keyboard(),
            b.animBars(),
            b.resize();
        },
        setDim: function () {
          var b,
            d,
            e = {};
          "onorientationchange" in a
            ? a.addEventListener(
                "orientationchange",
                function () {
                  0 === a.orientation
                    ? ((b = p), (d = q))
                    : (90 === a.orientation || -90 === a.orientation) &&
                      ((b = q), (d = p));
                },
                !1
              )
            : ((b = a.innerWidth ? a.innerWidth : c(a).width()),
              (d = a.innerHeight ? a.innerHeight : c(a).height())),
            (e = { width: b, height: d }),
            c("#swipebox-overlay").css(e);
        },
        resize: function () {
          var b = this;
          c(a)
            .resize(function () {
              b.setDim();
            })
            .resize();
        },
        supportTransition: function () {
          var a,
            c = "transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition".split(
              " "
            );
          for (a = 0; a < c.length; a++)
            if (b.createElement("div").style[c[a]] !== d) return c[a];
          return !1;
        },
        doCssTrans: function () {
          return j.settings.useCSS && this.supportTransition() ? !0 : void 0;
        },
        gesture: function () {
          var a,
            b,
            d,
            e,
            f,
            g,
            h = this,
            i = !1,
            j = !1,
            l = 10,
            m = 50,
            n = {},
            o = {},
            q = c("#swipebox-top-bar, #swipebox-bottom-bar"),
            s = c("#swipebox-slider");
          q.addClass("visible-bars"),
            h.setTimeout(),
            c("body")
              .bind("touchstart", function (h) {
                return (
                  c(this).addClass("touching"),
                  (a = c("#swipebox-slider .slide").index(
                    c("#swipebox-slider .slide.current")
                  )),
                  (o = h.originalEvent.targetTouches[0]),
                  (n.pageX = h.originalEvent.targetTouches[0].pageX),
                  (n.pageY = h.originalEvent.targetTouches[0].pageY),
                  c("#swipebox-slider").css({
                    "-webkit-transform": "translate3d(" + r + "%, 0, 0)",
                    transform: "translate3d(" + r + "%, 0, 0)",
                  }),
                  c(".touching").bind("touchmove", function (h) {
                    if (
                      (h.preventDefault(),
                      h.stopPropagation(),
                      (o = h.originalEvent.targetTouches[0]),
                      !j &&
                        ((f = d),
                        (d = o.pageY - n.pageY),
                        Math.abs(d) >= m || i))
                    ) {
                      var q = 0.75 - Math.abs(d) / s.height();
                      s.css({ top: d + "px" }), s.css({ opacity: q }), (i = !0);
                    }
                    (e = b),
                      (b = o.pageX - n.pageX),
                      (g = (100 * b) / p),
                      !j &&
                        !i &&
                        Math.abs(b) >= l &&
                        (c("#swipebox-slider").css({
                          "-webkit-transition": "",
                          transition: "",
                        }),
                        (j = !0)),
                      j &&
                        (b > 0
                          ? 0 === a
                            ? c("#swipebox-overlay").addClass("leftSpringTouch")
                            : (c("#swipebox-overlay")
                                .removeClass("leftSpringTouch")
                                .removeClass("rightSpringTouch"),
                              c("#swipebox-slider").css({
                                "-webkit-transform":
                                  "translate3d(" + (r + g) + "%, 0, 0)",
                                transform:
                                  "translate3d(" + (r + g) + "%, 0, 0)",
                              }))
                          : 0 > b &&
                            (k.length === a + 1
                              ? c("#swipebox-overlay").addClass(
                                  "rightSpringTouch"
                                )
                              : (c("#swipebox-overlay")
                                  .removeClass("leftSpringTouch")
                                  .removeClass("rightSpringTouch"),
                                c("#swipebox-slider").css({
                                  "-webkit-transform":
                                    "translate3d(" + (r + g) + "%, 0, 0)",
                                  transform:
                                    "translate3d(" + (r + g) + "%, 0, 0)",
                                }))));
                  }),
                  !1
                );
              })
              .bind("touchend", function (a) {
                if (
                  (a.preventDefault(),
                  a.stopPropagation(),
                  c("#swipebox-slider").css({
                    "-webkit-transition": "-webkit-transform 0.4s ease",
                    transition: "transform 0.4s ease",
                  }),
                  (d = o.pageY - n.pageY),
                  (b = o.pageX - n.pageX),
                  (g = (100 * b) / p),
                  i)
                )
                  if (
                    ((i = !1),
                    Math.abs(d) >= 2 * m && Math.abs(d) > Math.abs(f))
                  ) {
                    var k = d > 0 ? s.height() : -s.height();
                    s.animate({ top: k + "px", opacity: 0 }, 300, function () {
                      h.closeSlide();
                    });
                  } else s.animate({ top: 0, opacity: 1 }, 300);
                else
                  j
                    ? ((j = !1),
                      b >= l && b >= e
                        ? h.getPrev()
                        : -l >= b && e >= b && h.getNext())
                    : q.hasClass("visible-bars")
                    ? (h.clearTimeout(), h.hideBars())
                    : (h.showBars(), h.setTimeout());
                c("#swipebox-slider").css({
                  "-webkit-transform": "translate3d(" + r + "%, 0, 0)",
                  transform: "translate3d(" + r + "%, 0, 0)",
                }),
                  c("#swipebox-overlay")
                    .removeClass("leftSpringTouch")
                    .removeClass("rightSpringTouch"),
                  c(".touching").off("touchmove").removeClass("touching");
              });
        },
        setTimeout: function () {
          if (j.settings.hideBarsDelay > 0) {
            var b = this;
            b.clearTimeout(),
              (b.timeout = a.setTimeout(function () {
                b.hideBars();
              }, j.settings.hideBarsDelay));
          }
        },
        clearTimeout: function () {
          a.clearTimeout(this.timeout), (this.timeout = null);
        },
        showBars: function () {
          var a = c("#swipebox-top-bar, #swipebox-bottom-bar");
          this.doCssTrans()
            ? a.addClass("visible-bars")
            : (c("#swipebox-top-bar").animate({ top: 0 }, 500),
              c("#swipebox-bottom-bar").animate({ bottom: 0 }, 500),
              setTimeout(function () {
                a.addClass("visible-bars");
              }, 1e3));
        },
        hideBars: function () {
          var a = c("#swipebox-top-bar, #swipebox-bottom-bar");
          this.doCssTrans()
            ? a.removeClass("visible-bars")
            : (c("#swipebox-top-bar").animate({ top: "-50px" }, 500),
              c("#swipebox-bottom-bar").animate({ bottom: "-50px" }, 500),
              setTimeout(function () {
                a.removeClass("visible-bars");
              }, 1e3));
        },
        animBars: function () {
          var a = this,
            b = c("#swipebox-top-bar, #swipebox-bottom-bar");
          b.addClass("visible-bars"),
            a.setTimeout(),
            c("#swipebox-slider").click(function () {
              b.hasClass("visible-bars") || (a.showBars(), a.setTimeout());
            }),
            c("#swipebox-bottom-bar").hover(
              function () {
                a.showBars(), b.addClass("visible-bars"), a.clearTimeout();
              },
              function () {
                j.settings.hideBarsDelay > 0 &&
                  (b.removeClass("visible-bars"), a.setTimeout());
              }
            );
        },
        keyboard: function () {
          var b = this;
          c(a).bind("keyup", function (a) {
            a.preventDefault(),
              a.stopPropagation(),
              37 === a.keyCode
                ? b.getPrev()
                : 39 === a.keyCode
                ? b.getNext()
                : 27 === a.keyCode && b.closeSlide();
          });
        },
        actions: function () {
          var a = this,
            b = "touchend click";
          k.length < 2
            ? (c("#swipebox-bottom-bar").hide(),
              d === k[1] && c("#swipebox-top-bar").hide())
            : (c("#swipebox-prev").bind(b, function (b) {
                b.preventDefault(),
                  b.stopPropagation(),
                  a.getPrev(),
                  a.setTimeout();
              }),
              c("#swipebox-next").bind(b, function (b) {
                b.preventDefault(),
                  b.stopPropagation(),
                  a.getNext(),
                  a.setTimeout();
              })),
            c("#swipebox-close").bind(b, function () {
              a.closeSlide();
            });
        },
        setSlide: function (a, b) {
          b = b || !1;
          var d = c("#swipebox-slider");
          (r = 100 * -a),
            this.doCssTrans()
              ? d.css({
                  "-webkit-transform": "translate3d(" + 100 * -a + "%, 0, 0)",
                  transform: "translate3d(" + 100 * -a + "%, 0, 0)",
                })
              : d.animate({ left: 100 * -a + "%" }),
            c("#swipebox-slider .slide").removeClass("current"),
            c("#swipebox-slider .slide").eq(a).addClass("current"),
            this.setTitle(a),
            b && d.fadeIn(),
            c("#swipebox-prev, #swipebox-next").removeClass("disabled"),
            0 === a
              ? c("#swipebox-prev").addClass("disabled")
              : a === k.length - 1 &&
                j.settings.loopAtEnd !== !0 &&
                c("#swipebox-next").addClass("disabled");
        },
        openSlide: function (b) {
          c("html").addClass("swipebox-html"),
            n
              ? (c("html").addClass("swipebox-touch"),
                j.settings.hideCloseButtonOnMobile &&
                  c("html").addClass("swipebox-no-close-button"))
              : c("html").addClass("swipebox-no-touch"),
            c(a).trigger("resize"),
            this.setSlide(b, !0);
        },
        preloadMedia: function (a) {
          var b = this,
            c = null;
          k[a] !== d && (c = k[a].href),
            b.isVideo(c)
              ? b.openMedia(a)
              : setTimeout(function () {
                  b.openMedia(a);
                }, 1e3);
        },
        openMedia: function (a) {
          var b,
            e,
            f = this;
          return (
            k[a] !== d && (b = k[a].href),
            0 > a || a >= k.length
              ? !1
              : ((e = c("#swipebox-slider .slide").eq(a)),
                void (f.isVideo(b)
                  ? (e.html(f.getVideo(b)),
                    j.settings.afterMedia && j.settings.afterMedia(a))
                  : (e.addClass("slide-loading"),
                    f.loadMedia(b, function () {
                      e.removeClass("slide-loading"),
                        e.html(this),
                        j.settings.afterMedia && j.settings.afterMedia(a);
                    }))))
          );
        },
        setTitle: function (a) {
          var b = null;
          c("#swipebox-title").empty(),
            k[a] !== d && (b = k[a].title),
            b
              ? (c("#swipebox-top-bar").show(), c("#swipebox-title").append(b))
              : c("#swipebox-top-bar").hide();
        },
        isVideo: function (a) {
          if (a) {
            if (
              a.match(
                /(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/
              ) ||
              a.match(/vimeo\.com\/([0-9]*)/) ||
              a.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/)
            )
              return !0;
            if (a.toLowerCase().indexOf("swipeboxvideo=1") >= 0) return !0;
          }
        },
        parseUri: function (a, d) {
          var e = b.createElement("a"),
            f = {};
          return (
            (e.href = decodeURIComponent(a)),
            e.search &&
              (f = JSON.parse(
                '{"' +
                  e.search
                    .toLowerCase()
                    .replace("?", "")
                    .replace(/&/g, '","')
                    .replace(/=/g, '":"') +
                  '"}'
              )),
            c.isPlainObject(d) &&
              (f = c.extend(f, d, j.settings.queryStringData)),
            c
              .map(f, function (a, b) {
                return a && a > ""
                  ? encodeURIComponent(b) + "=" + encodeURIComponent(a)
                  : void 0;
              })
              .join("&")
          );
        },
        getVideo: function (a) {
          var b = "",
            c = a.match(
              /((?:www\.)?youtube\.com|(?:www\.)?youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/
            ),
            d = a.match(/(?:www\.)?youtu\.be\/([a-zA-Z0-9\-_]+)/),
            e = a.match(/(?:www\.)?vimeo\.com\/([0-9]*)/),
            f = "";
          return (
            c || d
              ? (d && (c = d),
                (f = g.parseUri(a, {
                  autoplay: j.settings.autoplayVideos ? "1" : "0",
                  v: "",
                })),
                (b =
                  '<iframe width="560" height="315" src="//' +
                  c[1] +
                  "/embed/" +
                  c[2] +
                  "?" +
                  f +
                  '" frameborder="0" allowfullscreen></iframe>'))
              : e
              ? ((f = g.parseUri(a, {
                  autoplay: j.settings.autoplayVideos ? "1" : "0",
                  byline: "0",
                  portrait: "0",
                  color: j.settings.vimeoColor,
                })),
                (b =
                  '<iframe width="560" height="315"  src="//player.vimeo.com/video/' +
                  e[1] +
                  "?" +
                  f +
                  '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'))
              : (b =
                  '<iframe width="560" height="315" src="' +
                  a +
                  '" frameborder="0" allowfullscreen></iframe>'),
            '<div class="swipebox-video-container" style="max-width:' +
              j.settings.videoMaxWidth +
              'px"><div class="swipebox-video">' +
              b +
              "</div></div>"
          );
        },
        loadMedia: function (a, b) {
          if (0 === a.trim().indexOf("#"))
            b.call(
              c("<div>", { class: "swipebox-inline-container" }).append(
                c(a).clone().toggleClass(j.settings.toggleClassOnLoad)
              )
            );
          else if (!this.isVideo(a)) {
            var d = c("<img>").on("load", function () {
              b.call(d);
            });
            d.attr("src", a);
          }
        },
        getNext: function () {
          var a,
            b = this,
            d = c("#swipebox-slider .slide").index(
              c("#swipebox-slider .slide.current")
            );
          d + 1 < k.length
            ? ((a = c("#swipebox-slider .slide")
                .eq(d)
                .contents()
                .find("iframe")
                .attr("src")),
              c("#swipebox-slider .slide")
                .eq(d)
                .contents()
                .find("iframe")
                .attr("src", a),
              d++,
              b.setSlide(d),
              b.preloadMedia(d + 1),
              j.settings.nextSlide && j.settings.nextSlide(d))
            : j.settings.loopAtEnd === !0
            ? ((a = c("#swipebox-slider .slide")
                .eq(d)
                .contents()
                .find("iframe")
                .attr("src")),
              c("#swipebox-slider .slide")
                .eq(d)
                .contents()
                .find("iframe")
                .attr("src", a),
              (d = 0),
              b.preloadMedia(d),
              b.setSlide(d),
              b.preloadMedia(d + 1),
              j.settings.nextSlide && j.settings.nextSlide(d))
            : (c("#swipebox-overlay").addClass("rightSpring"),
              setTimeout(function () {
                c("#swipebox-overlay").removeClass("rightSpring");
              }, 500));
        },
        getPrev: function () {
          var a,
            b = c("#swipebox-slider .slide").index(
              c("#swipebox-slider .slide.current")
            );
          b > 0
            ? ((a = c("#swipebox-slider .slide")
                .eq(b)
                .contents()
                .find("iframe")
                .attr("src")),
              c("#swipebox-slider .slide")
                .eq(b)
                .contents()
                .find("iframe")
                .attr("src", a),
              b--,
              this.setSlide(b),
              this.preloadMedia(b - 1),
              j.settings.prevSlide && j.settings.prevSlide(b))
            : (c("#swipebox-overlay").addClass("leftSpring"),
              setTimeout(function () {
                c("#swipebox-overlay").removeClass("leftSpring");
              }, 500));
        },
        nextSlide: function (a) {},
        prevSlide: function (a) {},
        closeSlide: function () {
          c("html").removeClass("swipebox-html"),
            c("html").removeClass("swipebox-touch"),
            c(a).trigger("resize"),
            this.destroy();
        },
        destroy: function () {
          c(a).unbind("keyup"),
            c("body").unbind("touchstart"),
            c("body").unbind("touchmove"),
            c("body").unbind("touchend"),
            c("#swipebox-slider").unbind(),
            c("#swipebox-overlay").remove(),
            c.isArray(e) || e.removeData("_swipebox"),
            this.target && this.target.trigger("swipebox-destroy"),
            (c.swipebox.isOpen = !1),
            j.settings.afterClose && j.settings.afterClose();
        },
      }),
      j.init();
  }),
    (c.fn.swipebox = function (a) {
      if (!c.data(this, "_swipebox")) {
        var b = new c.swipebox(this, a);
        this.data("_swipebox", b);
      }
      return this.data("_swipebox");
    });
})(window, document, jQuery);
/*!
 Waypoints - 4.0.1
 */
!(function () {
  "use strict";
  function t(o) {
    if (!o) throw new Error("No options passed to Waypoint constructor");
    if (!o.element)
      throw new Error("No element option passed to Waypoint constructor");
    if (!o.handler)
      throw new Error("No handler option passed to Waypoint constructor");
    (this.key = "waypoint-" + e),
      (this.options = t.Adapter.extend({}, t.defaults, o)),
      (this.element = this.options.element),
      (this.adapter = new t.Adapter(this.element)),
      (this.callback = o.handler),
      (this.axis = this.options.horizontal ? "horizontal" : "vertical"),
      (this.enabled = this.options.enabled),
      (this.triggerPoint = null),
      (this.group = t.Group.findOrCreate({
        name: this.options.group,
        axis: this.axis,
      })),
      (this.context = t.Context.findOrCreateByElement(this.options.context)),
      t.offsetAliases[this.options.offset] &&
        (this.options.offset = t.offsetAliases[this.options.offset]),
      this.group.add(this),
      this.context.add(this),
      (i[this.key] = this),
      (e += 1);
  }
  var e = 0,
    i = {};
  (t.prototype.queueTrigger = function (t) {
    this.group.queueTrigger(this, t);
  }),
    (t.prototype.trigger = function (t) {
      this.enabled && this.callback && this.callback.apply(this, t);
    }),
    (t.prototype.destroy = function () {
      this.context.remove(this), this.group.remove(this), delete i[this.key];
    }),
    (t.prototype.disable = function () {
      return (this.enabled = !1), this;
    }),
    (t.prototype.enable = function () {
      return this.context.refresh(), (this.enabled = !0), this;
    }),
    (t.prototype.next = function () {
      return this.group.next(this);
    }),
    (t.prototype.previous = function () {
      return this.group.previous(this);
    }),
    (t.invokeAll = function (t) {
      var e = [];
      for (var o in i) e.push(i[o]);
      for (var n = 0, r = e.length; r > n; n++) e[n][t]();
    }),
    (t.destroyAll = function () {
      t.invokeAll("destroy");
    }),
    (t.disableAll = function () {
      t.invokeAll("disable");
    }),
    (t.enableAll = function () {
      t.Context.refreshAll();
      for (var e in i) i[e].enabled = !0;
      return this;
    }),
    (t.refreshAll = function () {
      t.Context.refreshAll();
    }),
    (t.viewportHeight = function () {
      return window.innerHeight || document.documentElement.clientHeight;
    }),
    (t.viewportWidth = function () {
      return document.documentElement.clientWidth;
    }),
    (t.adapters = []),
    (t.defaults = {
      context: window,
      continuous: !0,
      enabled: !0,
      group: "default",
      horizontal: !1,
      offset: 0,
    }),
    (t.offsetAliases = {
      "bottom-in-view": function () {
        return this.context.innerHeight() - this.adapter.outerHeight();
      },
      "right-in-view": function () {
        return this.context.innerWidth() - this.adapter.outerWidth();
      },
    }),
    (window.Waypoint = t);
})(),
  (function () {
    "use strict";
    function t(t) {
      window.setTimeout(t, 1e3 / 60);
    }
    function e(t) {
      (this.element = t),
        (this.Adapter = n.Adapter),
        (this.adapter = new this.Adapter(t)),
        (this.key = "waypoint-context-" + i),
        (this.didScroll = !1),
        (this.didResize = !1),
        (this.oldScroll = {
          x: this.adapter.scrollLeft(),
          y: this.adapter.scrollTop(),
        }),
        (this.waypoints = { vertical: {}, horizontal: {} }),
        (t.waypointContextKey = this.key),
        (o[t.waypointContextKey] = this),
        (i += 1),
        n.windowContext ||
          ((n.windowContext = !0), (n.windowContext = new e(window))),
        this.createThrottledScrollHandler(),
        this.createThrottledResizeHandler();
    }
    var i = 0,
      o = {},
      n = window.Waypoint,
      r = window.onload;
    (e.prototype.add = function (t) {
      var e = t.options.horizontal ? "horizontal" : "vertical";
      (this.waypoints[e][t.key] = t), this.refresh();
    }),
      (e.prototype.checkEmpty = function () {
        var t = this.Adapter.isEmptyObject(this.waypoints.horizontal),
          e = this.Adapter.isEmptyObject(this.waypoints.vertical),
          i = this.element == this.element.window;
        t && e && !i && (this.adapter.off(".waypoints"), delete o[this.key]);
      }),
      (e.prototype.createThrottledResizeHandler = function () {
        function t() {
          e.handleResize(), (e.didResize = !1);
        }
        var e = this;
        this.adapter.on("resize.waypoints", function () {
          e.didResize || ((e.didResize = !0), n.requestAnimationFrame(t));
        });
      }),
      (e.prototype.createThrottledScrollHandler = function () {
        function t() {
          e.handleScroll(), (e.didScroll = !1);
        }
        var e = this;
        this.adapter.on("scroll.waypoints", function () {
          (!e.didScroll || n.isTouch) &&
            ((e.didScroll = !0), n.requestAnimationFrame(t));
        });
      }),
      (e.prototype.handleResize = function () {
        n.Context.refreshAll();
      }),
      (e.prototype.handleScroll = function () {
        var t = {},
          e = {
            horizontal: {
              newScroll: this.adapter.scrollLeft(),
              oldScroll: this.oldScroll.x,
              forward: "right",
              backward: "left",
            },
            vertical: {
              newScroll: this.adapter.scrollTop(),
              oldScroll: this.oldScroll.y,
              forward: "down",
              backward: "up",
            },
          };
        for (var i in e) {
          var o = e[i],
            n = o.newScroll > o.oldScroll,
            r = n ? o.forward : o.backward;
          for (var s in this.waypoints[i]) {
            var a = this.waypoints[i][s];
            if (null !== a.triggerPoint) {
              var l = o.oldScroll < a.triggerPoint,
                h = o.newScroll >= a.triggerPoint,
                p = l && h,
                u = !l && !h;
              (p || u) && (a.queueTrigger(r), (t[a.group.id] = a.group));
            }
          }
        }
        for (var c in t) t[c].flushTriggers();
        this.oldScroll = { x: e.horizontal.newScroll, y: e.vertical.newScroll };
      }),
      (e.prototype.innerHeight = function () {
        return this.element == this.element.window
          ? n.viewportHeight()
          : this.adapter.innerHeight();
      }),
      (e.prototype.remove = function (t) {
        delete this.waypoints[t.axis][t.key], this.checkEmpty();
      }),
      (e.prototype.innerWidth = function () {
        return this.element == this.element.window
          ? n.viewportWidth()
          : this.adapter.innerWidth();
      }),
      (e.prototype.destroy = function () {
        var t = [];
        for (var e in this.waypoints)
          for (var i in this.waypoints[e]) t.push(this.waypoints[e][i]);
        for (var o = 0, n = t.length; n > o; o++) t[o].destroy();
      }),
      (e.prototype.refresh = function () {
        var t,
          e = this.element == this.element.window,
          i = e ? void 0 : this.adapter.offset(),
          o = {};
        this.handleScroll(),
          (t = {
            horizontal: {
              contextOffset: e ? 0 : i.left,
              contextScroll: e ? 0 : this.oldScroll.x,
              contextDimension: this.innerWidth(),
              oldScroll: this.oldScroll.x,
              forward: "right",
              backward: "left",
              offsetProp: "left",
            },
            vertical: {
              contextOffset: e ? 0 : i.top,
              contextScroll: e ? 0 : this.oldScroll.y,
              contextDimension: this.innerHeight(),
              oldScroll: this.oldScroll.y,
              forward: "down",
              backward: "up",
              offsetProp: "top",
            },
          });
        for (var r in t) {
          var s = t[r];
          for (var a in this.waypoints[r]) {
            var l,
              h,
              p,
              u,
              c,
              d = this.waypoints[r][a],
              f = d.options.offset,
              w = d.triggerPoint,
              y = 0,
              g = null == w;
            d.element !== d.element.window &&
              (y = d.adapter.offset()[s.offsetProp]),
              "function" == typeof f
                ? (f = f.apply(d))
                : "string" == typeof f &&
                  ((f = parseFloat(f)),
                  d.options.offset.indexOf("%") > -1 &&
                    (f = Math.ceil((s.contextDimension * f) / 100))),
              (l = s.contextScroll - s.contextOffset),
              (d.triggerPoint = Math.floor(y + l - f)),
              (h = w < s.oldScroll),
              (p = d.triggerPoint >= s.oldScroll),
              (u = h && p),
              (c = !h && !p),
              !g && u
                ? (d.queueTrigger(s.backward), (o[d.group.id] = d.group))
                : !g && c
                ? (d.queueTrigger(s.forward), (o[d.group.id] = d.group))
                : g &&
                  s.oldScroll >= d.triggerPoint &&
                  (d.queueTrigger(s.forward), (o[d.group.id] = d.group));
          }
        }
        return (
          n.requestAnimationFrame(function () {
            for (var t in o) o[t].flushTriggers();
          }),
          this
        );
      }),
      (e.findOrCreateByElement = function (t) {
        return e.findByElement(t) || new e(t);
      }),
      (e.refreshAll = function () {
        for (var t in o) o[t].refresh();
      }),
      (e.findByElement = function (t) {
        return o[t.waypointContextKey];
      }),
      (window.onload = function () {
        r && r(), e.refreshAll();
      }),
      (n.requestAnimationFrame = function (e) {
        var i =
          window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          t;
        i.call(window, e);
      }),
      (n.Context = e);
  })(),
  (function () {
    "use strict";
    function t(t, e) {
      return t.triggerPoint - e.triggerPoint;
    }
    function e(t, e) {
      return e.triggerPoint - t.triggerPoint;
    }
    function i(t) {
      (this.name = t.name),
        (this.axis = t.axis),
        (this.id = this.name + "-" + this.axis),
        (this.waypoints = []),
        this.clearTriggerQueues(),
        (o[this.axis][this.name] = this);
    }
    var o = { vertical: {}, horizontal: {} },
      n = window.Waypoint;
    (i.prototype.add = function (t) {
      this.waypoints.push(t);
    }),
      (i.prototype.clearTriggerQueues = function () {
        this.triggerQueues = { up: [], down: [], left: [], right: [] };
      }),
      (i.prototype.flushTriggers = function () {
        for (var i in this.triggerQueues) {
          var o = this.triggerQueues[i],
            n = "up" === i || "left" === i;
          o.sort(n ? e : t);
          for (var r = 0, s = o.length; s > r; r += 1) {
            var a = o[r];
            (a.options.continuous || r === o.length - 1) && a.trigger([i]);
          }
        }
        this.clearTriggerQueues();
      }),
      (i.prototype.next = function (e) {
        this.waypoints.sort(t);
        var i = n.Adapter.inArray(e, this.waypoints),
          o = i === this.waypoints.length - 1;
        return o ? null : this.waypoints[i + 1];
      }),
      (i.prototype.previous = function (e) {
        this.waypoints.sort(t);
        var i = n.Adapter.inArray(e, this.waypoints);
        return i ? this.waypoints[i - 1] : null;
      }),
      (i.prototype.queueTrigger = function (t, e) {
        this.triggerQueues[e].push(t);
      }),
      (i.prototype.remove = function (t) {
        var e = n.Adapter.inArray(t, this.waypoints);
        e > -1 && this.waypoints.splice(e, 1);
      }),
      (i.prototype.first = function () {
        return this.waypoints[0];
      }),
      (i.prototype.last = function () {
        return this.waypoints[this.waypoints.length - 1];
      }),
      (i.findOrCreate = function (t) {
        return o[t.axis][t.name] || new i(t);
      }),
      (n.Group = i);
  })(),
  (function () {
    "use strict";
    function t(t) {
      this.$element = e(t);
    }
    var e = window.jQuery,
      i = window.Waypoint;
    e.each(
      [
        "innerHeight",
        "innerWidth",
        "off",
        "offset",
        "on",
        "outerHeight",
        "outerWidth",
        "scrollLeft",
        "scrollTop",
      ],
      function (e, i) {
        t.prototype[i] = function () {
          var t = Array.prototype.slice.call(arguments);
          return this.$element[i].apply(this.$element, t);
        };
      }
    ),
      e.each(["extend", "inArray", "isEmptyObject"], function (i, o) {
        t[o] = e[o];
      }),
      i.adapters.push({ name: "jquery", Adapter: t }),
      (i.Adapter = t);
  })(),
  (function () {
    "use strict";
    function t(t) {
      return function () {
        var i = [],
          o = arguments[0];
        return (
          t.isFunction(arguments[0]) &&
            ((o = t.extend({}, arguments[1])), (o.handler = arguments[0])),
          this.each(function () {
            var n = t.extend({}, o, { element: this });
            "string" == typeof n.context &&
              (n.context = t(this).closest(n.context)[0]),
              i.push(new e(n));
          }),
          i
        );
      };
    }
    var e = window.Waypoint;
    window.jQuery && (window.jQuery.fn.waypoint = t(window.jQuery)),
      window.Zepto && (window.Zepto.fn.waypoint = t(window.Zepto));
  })();
/*!
 Waypoints Sticky Element Shortcut - 4.0.1
 Copyright © 2011-2016 Caleb Troughton
 Licensed under the MIT license.
 https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
 */
!(function () {
  "use strict";
  function t(s) {
    (this.options = e.extend({}, i.defaults, t.defaults, s)),
      (this.element = this.options.element),
      (this.$element = e(this.element)),
      this.createWrapper(),
      this.createWaypoint();
  }
  var e = window.jQuery,
    i = window.Waypoint;
  (t.prototype.createWaypoint = function () {
    var t = this.options.handler;
    this.waypoint = new i(
      e.extend({}, this.options, {
        element: this.wrapper,
        handler: e.proxy(function (e) {
          var i = this.options.direction.indexOf(e) > -1,
            s = i ? this.$element.outerHeight(!0) : "";
          this.$wrapper.height(s),
            this.$element.toggleClass(this.options.stuckClass, i),
            t && t.call(this, e);
        }, this),
      })
    );
  }),
    (t.prototype.createWrapper = function () {
      this.options.wrapper && this.$element.wrap(this.options.wrapper),
        (this.$wrapper = this.$element.parent()),
        (this.wrapper = this.$wrapper[0]);
    }),
    (t.prototype.destroy = function () {
      this.$element.parent()[0] === this.wrapper &&
        (this.waypoint.destroy(),
        this.$element.removeClass(this.options.stuckClass),
        this.options.wrapper && this.$element.unwrap());
    }),
    (t.defaults = {
      wrapper: '<div class="sticky-wrapper" />',
      stuckClass: "stuck",
      direction: "down right",
    }),
    (i.Sticky = t);
})();
