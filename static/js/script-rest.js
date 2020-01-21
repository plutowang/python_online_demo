const API = {
  v1: {
    // api version
    codes: {
      list: function() {
        // get instances query
        return "/api/v1/codes";
      },
      detail: function(pk) {
        // get single instance
        return `/api/v1/codes/${pk}/`;
      },
      create: function() {
        return "/api/v1/codes/";
      },
      update: function(pk) {
        // update instance
        return `/api/v1/codes/${pk}/`;
      },
      remove: function(pk) {
        // delete instance
        return `/api/v1/codes/${pk}/`;
      },
      run: function() {
        return "/api/v1/codes/run/";
      },
      run_save: function() {
        return "/api/v1/codes/run/?save=true";
      },
      run_specific: function(pk) {
        return `/api/v1/codes/run/${pk}/`;
      },
      run_save_spec: function(ok) {
        return `/api/v1/codes/run/${pk}/?save=true`;
      }
    }
  }
};

let store = {
  list: {
    state: undefined,
    changed: false
  },
  detail: {
    state: undefined,
    changed: false
  },
  output: {
    state: undefined,
    changed: false
  }
};

// Format instances return from backend
function get_instance(data) {
  let instance = data.fields;
  instance.pk = data.pk;
  return instance;
}

// Get list of code from database and change list state
function get_list() {
  $.getJSON({
    url: API.v1.codes.list(),
    success: function(data) {
      store.list.state = data.instances;
      store.list.changed = true;
    }
  });
}

// Create instance
function create(code, name) {
  $.post({
    url: API.v1.codes.create(),
    data: { code: code, name: name },
    dataType: "json",
    success: function(data) {
      get_list();
      alert("Saved Successfully!");
    }
  });
}

// Update instance
function update(pk, code, name) {
  $.ajax({
    url: API.v1.codes.update(pk),
    type: "PUT",
    data: { coed: code, name: name },
    dataType: "json",
    success: function(data) {
      get_list();
      alert("Updated Successfully!");
    }
  });
}

function get_detail(pk) {
  $.getJSON({
    url: API.v1.codes.detail(pk),
    success: function(data) {
      let detail = get_instance(data.instances[0]);
      store.detail.state = detail;
      store.detail.changed = true;
    }
  });
}

// Delete code
function remove(pk) {
  $.ajax({
    url: API.v1.codes.remove(pk),
    type: "DELETE",
    dataType: "json",
    success: function(data) {
      get_list();
      alert("Delete Successfully!");
    }
  });
}

// Run code
function run(code) {
  $.post({
    url: API.v1.codes.run(),
    dataType: "json",
    data: { code: code },
    success: function(data) {
      let output = data.output;
      store.output.state = output;
      store.output.changed = true;
    }
  });
}

function run_save(code, name) {
  $.post({
    url: API.v1.codes.run_save(),
    dataType: "json",
    data: { code: code, name: name },
    success: function(data) {
      let output = data.output;
      store.output.state = output;
      store.output.changed = true;
      get_list();
      alert("Save Successfully!");
    }
  });
}

// Run speciific code and refresh state of output
function run_specific(pk) {
  $.get({
    url: API.v1.codes.run_specific(pk),
    dataType: "json",
    success: function(data) {
      let output = data.output;
      store.output.state = output;
      store.output.changed = true;
    }
  });
}

// Run speciific code, refresh state of output and list
function run_save_specific(pk, code, name) {
  $.ajax({
    url: API.v1.codes.run_save_specific(pk),
    type: "PUT",
    dataType: "json",
    data: { coed: code, name: name },
    success: function(data) {
      let output = data.output;
      store.output.state = output;
      store.output.changed = true;
      get_list();
      alert("Save Successfully!");
    }
  });
}

// Render list to table in html
function render_to_table(instance, tbody) {
  let name = instance.name;
  let pk = instance.pk;
  let options = `\
  <button class='btn btn-primary' onclick="get_detail(${pk})">Detail</button>\
  <button class='btn btn-primary' onclick="run_specific(${pk})">Run</button>\
  <button class='btn btn-danger' onclick="remove(${pk})">Delete</button>`;
  let child = `<tr><td class='text-center'>${name}</td><td>${options}</td></tr>`;
  tbody.append(child);
}

// Render option of codes in html
function render_specific_code_options(pk) {
  let options = `\
    <button class='btn btn-primary' onclick="run($('#code-input').val())">Run</button>\
    <button class='btn btn-primary' onclick="update(${pk},$('#code-input').val(),$('#code-name-input').val())">Save Changes</button>\
    <button class='btn' onclick="run_save_specific(${pk},$('#code-input').val(),$('#code-name-input').val())">Save and Run</button>\
    <button class='btn btn-primary' onclick="render_clear_code_options()">New</button>`;
  // Clear old opetions, then append current options
  $("#code-options")
    .empty()
    .append(options);
}

// New code opetions
function render_clear_code_options() {
  let options = `\
    <button class='btn btn-primary' onclick="run($('#code-input').val())">Run</button>\
    <button class='btn btn-primary' onclick="create($('#code-input').val(),$('#code-name-input').val())">Save</button>\
    <button class='btn btn-primary' onclick="run_save($('#code-input').val(),$('#code-name-input').val())">Save and Run</button>\
    <button class='btn btn-primary' onclick="render_clear_code_options()">New</button>`;
  $("#code-input").val(""); // Clear input box
  $("#code-output").val(""); // Clear output box
  $("#code-name-input").val(""); // Clear code name box
  $("#code-options")
    .empty()
    .append(options);
}

// Listen states and trigger action
function watcher() {
  for (let op in store) {
    switch (op) {
      case "list": // Refresh <table> UI of list when state of list changes
        if (store[op].changed) {
          let instances = store[op].state;
          let tbody = $("tbody");
          tbody.empty();

          for (let i = 0; i < instances.length; i++) {
            let instance = get_instance(instances[i]);
            render_to_table(instance, tbody);
          }
          //   for (const ins in instances) {
          //     let instance = get_instance(ins);
          //     render_to_table(instance, tbody);
          //   }

          store[op].changed = false;
        }
        break;
      case "detail": // Refresh input box, code name box when detail state changes, and result output box
        if (store[op].changed) {
          let instance = store[op].state;
          $("#code-input").val(instance.code);
          $("#code-name-input").val(instance.name);
          $("#code-output").val(""); // Clear last result in output box
          render_specific_code_options(instance.pk);
          store[op].changed = false;
        }
        break;
      case "output":
        if (store[op].changed) {
          let output = store[op].state;
          $("#code-output").val(output);
          store[op].changed = false;
        }
        break;
    }
  }
}

get_list(); // init
render_clear_code_options(); // render
setInterval("watcher()", 500);

// auto resize
// $('textarea').autoresize(minRows, maxRows);
$("textarea").autoresize(5, 10);

// // add line number for input box
// $("#code-input").linenumbers({
//   // The width of the numbers column.
//   // Default should be big enough for 4 columns on a text area with no styles applied.
//   // This will need to be modified for the number of digits you choose, and the textarea styles.
//   col_width: "300px",

//   // The number at which line numbering starts.
//   start: 1,

//   // The number of digits the line numbers should max out at.
//   // This is used for calculating leading space, and does not include the colon.
//   digits: 4
// });
