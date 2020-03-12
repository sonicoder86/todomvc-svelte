
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const ACTION_TYPES = {
      load: 'LOAD',
      create: 'CREATE',
      remove: 'REMOVE',
      update: 'UPDATE_TODO',
      completeAll: 'COMPLETE_ALL',
      clearCompleted: 'CLEAR_COMPLETED',
      selectFilter: 'SELECT_FILTER',
    };

    const onLoad = todos => ({ type: ACTION_TYPES.load, todos });
    const onCreate = name => ({ type: ACTION_TYPES.create, name });
    const onRemove = id => ({ type: ACTION_TYPES.remove, id });
    const onUpdate = values => ({ type: ACTION_TYPES.update, values });
    const onCompleteAll = () => ({ type: ACTION_TYPES.completeAll });
    const onClearCompleted = () => ({ type: ACTION_TYPES.clearCompleted });

    /* src/components/header/header.svelte generated by Svelte v3.19.1 */
    const file = "src/components/header/header.svelte";

    function create_fragment(ctx) {
    	let header;
    	let h1;
    	let t1;
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "todos";
    			t1 = space();
    			input = element("input");
    			add_location(h1, file, 20, 2, 430);
    			attr_dev(input, "class", "new-todo");
    			attr_dev(input, "placeholder", "What needs to be done?");
    			input.value = /*name*/ ctx[0];
    			attr_dev(input, "data-testid", "todo-create");
    			add_location(input, file, 21, 2, 447);
    			attr_dev(header, "class", "header");
    			add_location(header, file, 19, 0, 404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, input);

    			dispose = [
    				listen_dev(input, "input", /*handleChange*/ ctx[1], false, false, false),
    				listen_dev(input, "keyup", /*handleSubmit*/ ctx[2], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && input.value !== /*name*/ ctx[0]) {
    				prop_dev(input, "value", /*name*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ENTER_KEY = "Enter";

    function instance($$self, $$props, $$invalidate) {
    	const store = getContext("store");
    	let name = "";
    	const handleChange = event => $$invalidate(0, name = event.target.value);

    	const handleSubmit = event => {
    		if (event.key !== ENTER_KEY) {
    			return;
    		}

    		store.dispatch(onCreate(name));
    		$$invalidate(0, name = "");
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onCreate,
    		store,
    		ENTER_KEY,
    		name,
    		handleChange,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, handleChange, handleSubmit];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/item/item.svelte generated by Svelte v3.19.1 */
    const file$1 = "src/components/item/item.svelte";

    function create_fragment$1(ctx) {
    	let li;
    	let div;
    	let input0;
    	let input0_checked_value;
    	let t0;
    	let label;
    	let t1_value = /*todo*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let button;
    	let t3;
    	let input1;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			button = element("button");
    			t3 = space();
    			input1 = element("input");
    			attr_dev(input0, "class", "toggle");
    			attr_dev(input0, "type", "checkbox");
    			input0.checked = input0_checked_value = /*todo*/ ctx[0].completed;
    			add_location(input0, file$1, 32, 4, 699);
    			attr_dev(label, "data-testid", "todo-name");
    			add_location(label, file$1, 38, 4, 825);
    			attr_dev(button, "class", "destroy");
    			attr_dev(button, "data-testid", "todo-remove");
    			add_location(button, file$1, 39, 4, 905);
    			attr_dev(div, "class", "view");
    			add_location(div, file$1, 31, 2, 676);
    			attr_dev(input1, "class", "edit");
    			input1.value = /*name*/ ctx[2];
    			add_location(input1, file$1, 45, 4, 1017);
    			attr_dev(li, "data-testid", "todo-item");
    			toggle_class(li, "editing", /*editing*/ ctx[1]);
    			toggle_class(li, "completed", /*todo*/ ctx[0].completed);
    			add_location(li, file$1, 30, 0, 588);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(div, input0);
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);
    			append_dev(div, t2);
    			append_dev(div, button);
    			append_dev(li, t3);
    			append_dev(li, input1);

    			dispose = [
    				listen_dev(input0, "change", /*handleCompleted*/ ctx[4], false, false, false),
    				listen_dev(label, "dblclick", /*handleEdit*/ ctx[3], false, false, false),
    				listen_dev(button, "click", /*handleRemove*/ ctx[5], false, false, false),
    				listen_dev(input1, "input", /*handleChange*/ ctx[6], false, false, false),
    				listen_dev(input1, "blur", /*handleBlur*/ ctx[7], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todo*/ 1 && input0_checked_value !== (input0_checked_value = /*todo*/ ctx[0].completed)) {
    				prop_dev(input0, "checked", input0_checked_value);
    			}

    			if (dirty & /*todo*/ 1 && t1_value !== (t1_value = /*todo*/ ctx[0].name + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*name*/ 4 && input1.value !== /*name*/ ctx[2]) {
    				prop_dev(input1, "value", /*name*/ ctx[2]);
    			}

    			if (dirty & /*editing*/ 2) {
    				toggle_class(li, "editing", /*editing*/ ctx[1]);
    			}

    			if (dirty & /*todo*/ 1) {
    				toggle_class(li, "completed", /*todo*/ ctx[0].completed);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { todo } = $$props;
    	let editing = false;
    	let name = todo.name;
    	const handleEdit = () => $$invalidate(1, editing = true);

    	const handleCompleted = () => {
    		dispatch("update", { id: todo.id, completed: !todo.completed });
    	};

    	const handleRemove = () => dispatch("remove", todo.id);
    	const handleChange = event => $$invalidate(2, name = event.target.value);

    	const handleBlur = () => {
    		dispatch("update", { id: todo.id, name });
    		$$invalidate(1, editing = false);
    	};

    	const writable_props = ["todo"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		todo,
    		editing,
    		name,
    		handleEdit,
    		handleCompleted,
    		handleRemove,
    		handleChange,
    		handleBlur
    	});

    	$$self.$inject_state = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    		if ("editing" in $$props) $$invalidate(1, editing = $$props.editing);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		todo,
    		editing,
    		name,
    		handleEdit,
    		handleCompleted,
    		handleRemove,
    		handleChange,
    		handleBlur
    	];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { todo: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todo*/ ctx[0] === undefined && !("todo" in props)) {
    			console.warn("<Item> was created without expected prop 'todo'");
    		}
    	}

    	get todo() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todo(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/list/list.svelte generated by Svelte v3.19.1 */
    const file$2 = "src/components/list/list.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (22:4) {#each $visibleTodos as todo}
    function create_each_block(ctx) {
    	let current;

    	const item = new Item({
    			props: { todo: /*todo*/ ctx[8] },
    			$$inline: true
    		});

    	item.$on("remove", /*remove*/ ctx[3]);
    	item.$on("update", /*update*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(item.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item_changes = {};
    			if (dirty & /*$visibleTodos*/ 2) item_changes.todo = /*todo*/ ctx[8];
    			item.$set(item_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(item, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(22:4) {#each $visibleTodos as todo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let section;
    	let input;
    	let t0;
    	let label;
    	let t1;
    	let ul;
    	let current;
    	let dispose;
    	let each_value = /*$visibleTodos*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "id", "toggle-all");
    			attr_dev(input, "class", "toggle-all");
    			attr_dev(input, "type", "checkbox");
    			input.checked = /*$areAllCompleted*/ ctx[0];
    			input.readOnly = true;
    			add_location(input, file$2, 17, 2, 535);
    			attr_dev(label, "for", "toggle-all");
    			add_location(label, file$2, 18, 2, 634);
    			attr_dev(ul, "class", "todo-list");
    			add_location(ul, file$2, 20, 2, 693);
    			attr_dev(section, "class", "main");
    			add_location(section, file$2, 16, 0, 510);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, input);
    			append_dev(section, t0);
    			append_dev(section, label);
    			append_dev(section, t1);
    			append_dev(section, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    			dispose = listen_dev(label, "click", /*completeAll*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$areAllCompleted*/ 1) {
    				prop_dev(input, "checked", /*$areAllCompleted*/ ctx[0]);
    			}

    			if (dirty & /*$visibleTodos, remove, update*/ 26) {
    				each_value = /*$visibleTodos*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $areAllCompleted;
    	let $visibleTodos;
    	const store = getContext("store");
    	const completeAll = () => store.dispatch(onCompleteAll());
    	const remove = event => store.dispatch(onRemove(event.detail));
    	const update = event => store.dispatch(onUpdate(event.detail));
    	const { visibleTodos } = store.selectors;
    	validate_store(visibleTodos, "visibleTodos");
    	component_subscribe($$self, visibleTodos, value => $$invalidate(1, $visibleTodos = value));
    	const { areAllCompleted } = store.selectors;
    	validate_store(areAllCompleted, "areAllCompleted");
    	component_subscribe($$self, areAllCompleted, value => $$invalidate(0, $areAllCompleted = value));

    	$$self.$capture_state = () => ({
    		getContext,
    		onCompleteAll,
    		onRemove,
    		onUpdate,
    		Item,
    		store,
    		completeAll,
    		remove,
    		update,
    		visibleTodos,
    		areAllCompleted,
    		name,
    		$areAllCompleted,
    		$visibleTodos
    	});

    	return [
    		$areAllCompleted,
    		$visibleTodos,
    		completeAll,
    		remove,
    		update,
    		visibleTodos,
    		areAllCompleted
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const FILTERS = {
      all: 'all',
      active: 'active',
      completed: 'completed',
    };

    const onFilterSelect = filter => ({ type: ACTION_TYPES.selectFilter, filter });

    /* src/components/footer/footer.svelte generated by Svelte v3.19.1 */
    const file$3 = "src/components/footer/footer.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (26:4) {#each filterTitles as filterTitle}
    function create_each_block$1(ctx) {
    	let li;
    	let a;
    	let t0_value = /*filterTitle*/ ctx[13].value + "";
    	let t0;
    	let t1;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[12](/*filterTitle*/ ctx[13], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", "#");
    			toggle_class(a, "selected", /*filterTitle*/ ctx[13].key === /*$filter*/ ctx[2]);
    			add_location(a, file$3, 27, 8, 1005);
    			add_location(li, file$3, 26, 6, 992);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    			dispose = listen_dev(a, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*filterTitles, $filter*/ 20) {
    				toggle_class(a, "selected", /*filterTitle*/ ctx[13].key === /*$filter*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(26:4) {#each filterTitles as filterTitle}",
    		ctx
    	});

    	return block;
    }

    // (38:2) {#if $completedCount }
    function create_if_block(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Clear completed";
    			attr_dev(button, "class", "clear-completed");
    			add_location(button, file$3, 38, 4, 1253);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			dispose = listen_dev(button, "click", /*clearCompleted*/ ctx[10], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(38:2) {#if $completedCount }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let footer;
    	let span1;
    	let strong;
    	let t0;
    	let t1;
    	let span0;
    	let t2;
    	let t3;
    	let t4;
    	let ul;
    	let t5;
    	let each_value = /*filterTitles*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block = /*$completedCount*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			span1 = element("span");
    			strong = element("strong");
    			t0 = text(/*$itemsLeft*/ ctx[0]);
    			t1 = space();
    			span0 = element("span");
    			t2 = text(/*$itemText*/ ctx[1]);
    			t3 = text(" left");
    			t4 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			if (if_block) if_block.c();
    			add_location(strong, file$3, 23, 27, 856);
    			add_location(span0, file$3, 23, 57, 886);
    			attr_dev(span1, "class", "todo-count");
    			add_location(span1, file$3, 23, 2, 831);
    			attr_dev(ul, "class", "filters");
    			add_location(ul, file$3, 24, 2, 925);
    			attr_dev(footer, "class", "footer");
    			add_location(footer, file$3, 22, 0, 805);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, span1);
    			append_dev(span1, strong);
    			append_dev(strong, t0);
    			append_dev(span1, t1);
    			append_dev(span1, span0);
    			append_dev(span0, t2);
    			append_dev(span0, t3);
    			append_dev(footer, t4);
    			append_dev(footer, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(footer, t5);
    			if (if_block) if_block.m(footer, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$itemsLeft*/ 1) set_data_dev(t0, /*$itemsLeft*/ ctx[0]);
    			if (dirty & /*$itemText*/ 2) set_data_dev(t2, /*$itemText*/ ctx[1]);

    			if (dirty & /*filterTitles, $filter, filterSelect*/ 532) {
    				each_value = /*filterTitles*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*$completedCount*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(footer, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $itemsLeft;
    	let $itemText;
    	let $filter;
    	let $completedCount;
    	const store = getContext("store");

    	const filterTitles = [
    		{ key: FILTERS.all, value: "All" },
    		{ key: FILTERS.active, value: "Active" },
    		{
    			key: FILTERS.completed,
    			value: "Completed"
    		}
    	];

    	const { filter } = store.state;
    	validate_store(filter, "filter");
    	component_subscribe($$self, filter, value => $$invalidate(2, $filter = value));
    	const { itemsLeft, completedCount } = store.selectors;
    	validate_store(itemsLeft, "itemsLeft");
    	component_subscribe($$self, itemsLeft, value => $$invalidate(0, $itemsLeft = value));
    	validate_store(completedCount, "completedCount");
    	component_subscribe($$self, completedCount, value => $$invalidate(3, $completedCount = value));
    	const itemText = derived(itemsLeft, itemCount => itemCount === 1 ? "item" : "items");
    	validate_store(itemText, "itemText");
    	component_subscribe($$self, itemText, value => $$invalidate(1, $itemText = value));
    	const filterSelect = filter => store.dispatch(onFilterSelect(filter));
    	const clearCompleted = () => store.dispatch(onClearCompleted());
    	const click_handler = filterTitle => filterSelect(filterTitle.key);

    	$$self.$capture_state = () => ({
    		getContext,
    		derived,
    		FILTERS,
    		onFilterSelect,
    		onClearCompleted,
    		store,
    		filterTitles,
    		filter,
    		itemsLeft,
    		completedCount,
    		itemText,
    		filterSelect,
    		clearCompleted,
    		$itemsLeft,
    		$itemText,
    		$filter,
    		$completedCount
    	});

    	return [
    		$itemsLeft,
    		$itemText,
    		$filter,
    		$completedCount,
    		filterTitles,
    		filter,
    		itemsLeft,
    		completedCount,
    		itemText,
    		filterSelect,
    		clearCompleted,
    		store,
    		click_handler
    	];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/copy-right/copy-right.svelte generated by Svelte v3.19.1 */

    const file$4 = "src/components/copy-right/copy-right.svelte";

    function create_fragment$4(ctx) {
    	let footer;
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let a0;
    	let t4;
    	let p2;
    	let t5;
    	let a1;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			p0 = element("p");
    			p0.textContent = "Double-click to edit a todo";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("Created by ");
    			a0 = element("a");
    			a0.textContent = "blacksonic";
    			t4 = space();
    			p2 = element("p");
    			t5 = text("Part of ");
    			a1 = element("a");
    			a1.textContent = "TodoMVC";
    			attr_dev(p0, "data-testid", "instruction");
    			add_location(p0, file$4, 1, 2, 24);
    			attr_dev(a0, "href", "http://github.com/blacksonic/");
    			add_location(a0, file$4, 2, 16, 101);
    			add_location(p1, file$4, 2, 2, 87);
    			attr_dev(a1, "href", "http://todomvc.com");
    			add_location(a1, file$4, 3, 13, 173);
    			add_location(p2, file$4, 3, 2, 162);
    			attr_dev(footer, "class", "info");
    			add_location(footer, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p0);
    			append_dev(footer, t1);
    			append_dev(footer, p1);
    			append_dev(p1, t2);
    			append_dev(p1, a0);
    			append_dev(footer, t4);
    			append_dev(footer, p2);
    			append_dev(p2, t5);
    			append_dev(p2, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Copy_right extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Copy_right",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const LOCAL_STORAGE_KEY = 'todoapp_todos';

    class TodoLocal {
      static loadTodos() {
        return JSON.parse(
          window.localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
        );
      }

      static storeTodos(todos) {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
      }
    }

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);
    var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

    function rng() {
      if (!getRandomValues) {
        throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
      }

      return getRandomValues(rnds8);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */
    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex[i] = (i + 0x100).toString(16).substr(1);
    }

    function bytesToUuid(buf, offset) {
      var i = offset || 0;
      var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

      return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
    }

    function v4(options, buf, offset) {
      var i = buf && offset || 0;

      if (typeof options == 'string') {
        buf = options === 'binary' ? new Array(16) : null;
        options = null;
      }

      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        for (var ii = 0; ii < 16; ++ii) {
          buf[i + ii] = rnds[ii];
        }
      }

      return buf || bytesToUuid(rnds);
    }

    function selectVisible(todos, filter) {
      switch (filter) {
        case FILTERS.all:
          return [...todos];
        case FILTERS.completed:
          return selectCompleted(todos);
        case FILTERS.active:
          return selectNotCompleted(todos);
        default:
          return [...todos];
      }
    }

    function selectNotCompleted(todos) {
      return todos.filter(todo => !todo.completed);
    }

    function selectCompleted(todos) {
      return todos.filter(todo => todo.completed);
    }

    const todosReducer = (state = [], action) => {
      switch (action.type) {
        case ACTION_TYPES.load:
          return [...action.todos];
        case ACTION_TYPES.create:
          return [...state, { id: v4(), name: action.name, completed: false }];
        case ACTION_TYPES.update:
          return state.map(
            todo => todo.id === action.values.id ? { ...todo, ...action.values } : todo
          );
        case ACTION_TYPES.remove:
          return state.filter(todo => todo.id !== action.id);
        case ACTION_TYPES.completeAll:
          const areAllCompleted = state.length && selectCompleted(state).length === state.length;
          return state.map(
            todo => ({ ...todo, ...{ completed: !areAllCompleted } })
          );
        case ACTION_TYPES.clearCompleted:
          return selectNotCompleted(state);
        default:
          return state;
      }
    };

    const filterReducer = (state = FILTERS.all, action) => {
      switch (action.type) {
        case ACTION_TYPES.selectFilter:
          return action.filter;
        default:
          return state;
      }
    };

    function reduce(reducer, initial) {
      const state = writable(initial);

      const subscribe = run => state.subscribe(run);
      const dispatch = action => {
        state.update(value => reducer(value, action));
      };

      return { state, subscribe, dispatch };
    }

    const createStore = (state = { todos: [], filter: FILTERS.all }) => {
      const todos = reduce(todosReducer, state.todos);
      const filter = reduce(filterReducer, state.filter);

      return {
        state: {
          todos: todos.state,
          filter: filter.state
        },
        dispatch(action) {
          todos.dispatch(action);
          filter.dispatch(action);
        },
        selectors: {
          itemsLeft: derived(todos, todos => selectNotCompleted(todos).length),
          completedCount: derived(todos, todos => selectCompleted(todos).length),
          visibleTodos: derived([todos, filter], ([todos, filter]) => selectVisible(todos, filter)),
          areAllCompleted: derived(todos, todos => todos.length && todos.every(todo => todo.completed))
        }
      };
    };

    /* src/components/app/app.svelte generated by Svelte v3.19.1 */
    const file$5 = "src/components/app/app.svelte";

    // (24:4) {#if $todos.length}
    function create_if_block_1(ctx) {
    	let current;
    	const list = new List({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(list.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(list, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(list, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(24:4) {#if $todos.length}",
    		ctx
    	});

    	return block;
    }

    // (27:4) {#if $todos.length}
    function create_if_block$1(ctx) {
    	let current;
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(footer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(27:4) {#if $todos.length}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let section;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	const header = new Header({ $$inline: true });
    	let if_block0 = /*$todos*/ ctx[0].length && create_if_block_1(ctx);
    	let if_block1 = /*$todos*/ ctx[0].length && create_if_block$1(ctx);
    	const copyright = new Copy_right({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			section = element("section");
    			create_component(header.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			create_component(copyright.$$.fragment);
    			attr_dev(section, "class", "todoapp");
    			add_location(section, file$5, 21, 2, 667);
    			attr_dev(div, "id", "app");
    			add_location(div, file$5, 20, 0, 650);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, section);
    			mount_component(header, section, null);
    			append_dev(section, t0);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t1);
    			if (if_block1) if_block1.m(section, null);
    			append_dev(div, t2);
    			mount_component(copyright, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$todos*/ ctx[0].length) {
    				if (!if_block0) {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(section, t1);
    				} else {
    					transition_in(if_block0, 1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$todos*/ ctx[0].length) {
    				if (!if_block1) {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(section, null);
    				} else {
    					transition_in(if_block1, 1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(copyright.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(copyright.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(header);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(copyright);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $todos;
    	const store = createStore();
    	setContext("store", store);
    	const { todos } = store.state;
    	validate_store(todos, "todos");
    	component_subscribe($$self, todos, value => $$invalidate(0, $todos = value));

    	onMount(() => {
    		store.dispatch(onLoad(TodoLocal.loadTodos()));
    		todos.subscribe(todos => TodoLocal.storeTodos(todos));
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		setContext,
    		Header,
    		List,
    		Footer,
    		CopyRight: Copy_right,
    		TodoLocal,
    		createStore,
    		onLoad,
    		store,
    		todos,
    		$todos
    	});

    	return [$todos, todos];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
      target: document.querySelector('app-root')
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
