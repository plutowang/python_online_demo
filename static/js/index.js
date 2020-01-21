let api = {
  v1: {
    run: () => {
      return "/api/v1/run/";
    },
    code: {
      list: () => {
        return "/api/v1/code/";
      },
      create: (run = false) => {
        let base = "/api/v1/code/";
        return run ? base + "?run" : base;
      },
      detail: (id, run = false) => {
        let base = `/api/v1/code/${id}/`;
        return run ? base + "?run" : base;
      },
      remove: id => {
        return api.v1.code.detail(id, false);
      },
      update: (id, run = false) => {
        return api.v1.code.detail(id, run);
      }
    }
  }
};

let store = {
  state: {
    list: [],
    code: "",
    name: "",
    id: "",
    output: "",
    changed_time: ""
  },
  actions: {
    fresh_list: () => {
      $.getJSON({
        url: api.v1.code.list(),
        success: data => {
          store.state.list = data;
        }
      });
    },
    run: code => {
      $.post({
        url: api.v1.run(),
        data: { code: code },
        dataType: "json",
        success: data => {
          store.state.output = data.output;
        }
      });
    },
    run_detail: id => {
      $.getJSON({
        url: api.v1.run() + `?id=${id}`,
        success: data => {
          store.state.output = data.output;
        }
      });
    },
    get_detail: id => {
      $.getJSON({
        url: api.v1.code.detail(id),
        success: data => {
          store.state.output = "";
          store.state.id = data.id;
          store.state.name = data.name;
          store.state.code = data.code;
        }
      });
    },
    create: (run = false) => {
      $.post({
        url: api.v1.code.create(run),
        data: {
          name: store.state.name,
          code: store.state.code
        },
        dataType: "json",
        success: data => {
          if (run) store.state.output = data.output;
          store.actions.fresh_list();
        }
      });
    },
    update: (id, run = false) => {
      $.ajax({
        type: "PUT",
        url: api.v1.code.update(id, run),
        data: {
          name: store.state.name,
          code: store.state.code
        },
        dataType: "json",
        success: data => {
          if (run) store.state.output = data.output;
          store.actions.fresh_list();
        }
      });
    },
    remove: id => {
      $.ajax({
        type: "DELETE",
        url: api.v1.code.remove(id),
        dataType: "json",
        success: data => {
          store.actions.fresh_list();
        }
      });
    }
  }
};

// initialize Store, get code list
store.actions.fresh_list();

// code-input
let input = {
  template: `
    <div class='from-group'>
        <textarea 
            class='form-control' 
            id='input'
            :value='state.code'
            @input='inputHandler'>
            </textarea>
        <label for='code-name-input'>Code Name</label>
        <p class='text-info'></p>
        <input
            type='text'
            placeholder='Enter code name, if save code'
            class='form-control'
            :value='state.name'
            @input='e => state.name = e.target.value'
        >
    
    </div>`,
  data() {
    return {
      state: store.state
    };
  },
  methods: {
    flexSize(selector) {
      let ele = $(selector);
      ele
        .css({
          height: "auto",
          "overflow-y": "hidden"
        })
        .height(ele.prop("scrollHeight"));
    },
    inputHandler(e) {
      this.state.code = e.target.value;
      this.flexSize(e.target);
    }
  }
};

// list commponent
let list = {
  template: `
    <table class='table table-striped table-hover'>
        <thead> <!-- List of File-->
            <tr> <!-- Head of Table -->
                <th class='text-center'>File Name</th>
                <th class='text-center'>Options</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for='code in state.list'>
                <td class='text-center'>{{ code.name }}</td>
                <td>
                    <button class='btn btn-primary' @click='get_detail(code.id)'>Detail</button>
                    <button class='btn btn-primary' @click='run(code.id)'>Run</button>
                    <button class='btn btn-danger' @click='remove(code.id)'>Delete</button>
                </td>
            </tr>
        </tbody>
    </table>`,
  data() {
    return {
      state: store.state
    };
  },
  methods: {
    get_detail(id) {
      store.actions.get_detail(id);
    },
    run(id) {
      store.actions.run_detail(id);
    },
    remove(id) {
      store.actions.remove(id);
    }
  }
};

// options component
let options = {
  template: `
  <div style='display: flex;
    justify-content: space-around;
    flex-warp: warp'>
        <button class='btn btn-primary' @click='run(state.code)'>Run</button>
        <button class='btn btn-primary' @click='update(state.id)'>Save</button>
        <button class='btn btn' @click='update(state.id, true)'>Save & Run</button>
        <button class='btn btn-primary' @click='newOpt'>New</button>
    </div> <!-- Flex Layout for Options -->`,
  data() {
    return {
      state: store.state
    };
  },
  methods: {
    run(code) {
      store.actions.run(code);
    },
    update(id, run = false) {
      if (typeof id == "string") {
        store.actions.create(run);
      } else {
        store.actions.update(id, run);
      }
    },
    newOpt() {
      this.state.id = "";
      this.state.name = "";
      this.state.code = "";
      this.state.output = "";
    },
    debug: (e) => {
        console.log(e.currentTarget);
        console.log(e);
      }
  }
  
};

// output component
let output = {
  template: `
    <textarea 
        id="code-output" disabled
        class="form-control text-center">
        {{ state.output }}
    </textarea><!-- Output Result -->`,
  data() {
    return {
      state: store.state
    };
  },
  updated() {
    let ele = $(this.$el);
    ele
      .css({
        height: "auto",
        "overflow-y": "hidden"
      })
      .height(ele.prop("scrollHeight"));
  }
};

// layout of the page
let app = {
  template: `
    <div class='container-fluid'>
        <div class='row justify-content-center h1'>
            Python Interpreter Online
        </div>

        <hr>
        
        <div class='row'>
            <div class='col-md-3'>
                <code-list></code-list> <!-- List of Codes-->
            </div>
            <div class='col-md-5'>
                <div class='container-fluid'>
                        <div class='col-md-6'>
                            <p class='text-center h3'>Input Code</p>
                            <code-input></code-input>
                            <hr>
                            <code-options></code-options> <!-- Flex Layout for Options -->
                        </div>
                </div>
            </div>
            <div class='col-md-4'>
                <div class='container-fluid'>
                    <p class="text-center h3">Output</p>
                    <div class='col-md-6'><!-- Output Result -->
                        <code-output></code-output>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
  components: {
    "code-input": input,
    "code-list": list,
    "code-options": options,
    "code-output": output
  }
};
// root component
let root = new Vue({
  el: "#app",
  template: `<app></app>`,
  components: {
    app: app
  },
});
