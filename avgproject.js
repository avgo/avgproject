
function dtm_fmt_def(d)
{
  return (
    pad(d.getDate()) + "." +
    pad(d.getMonth()+1) + "." +
    pad(d.getFullYear()) + ", " +
    pad(d.getHours()) + ":" +
    pad(d.getMinutes()) + ":" +
    pad(d.getSeconds())
  );
}

function post_request(url, arr1)
{
  if (!url)
    url = "";

  var query1 = ""; var amp1 = 0;

  function append(arr)
  {
    var comp = arr[1];
    return arr[0] + "=" + ( comp == null ? "" : encodeURIComponent(comp) );
  }

  if (arr1)
  {
    for (var i = 0; i < arr1.length; ++i)
    {
      if (amp1)
        query1 += "&";
      else
        amp1 = 1;
      query1 += append(arr1[i]);
    }
  }

  return {
    set: function(arr2, success)
    {
      var query2 = query1; var amp2 = amp1;

      for (var i = 0; i < arr2.length; ++i)
      {
        if (amp2)
          query2 += "&";
        else
          amp2 = 1;
        query2 += append(arr2[i]);
      }
      var r = new XMLHttpRequest();
      r.onreadystatechange = function ()
      {
        switch (r.readyState)
        {
        case 4:
          if (r.status == 200)
            success(r);
          else
            alert("request error.");
          break;
        }
      }
      r.open("POST", url, true);
      r.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      r.send(query2);
    },
  };
}

var avgproject =
{
  comment: function (comment)
  {
    var updater = post_request(
      "",
      [
        [ "action",  7           ],
        [ "id",      comment.id  ],
      ]
    );

    var tbl = document.createElement("table");

    if (comment.type == 1)
      tbl.className = "comment comment-logwork";
    else
      tbl.className = "comment comment-comment";

    var tr, td;

    if (comment.type == 1)
    {
      tr = document.createElement("tr");

      td = document.createElement("td");
      td.style.setProperty("padding", "3px 3px 3px 10px");
      td.style.setProperty("text-align", "center");
      td.style.setProperty("width", "150px");
      var dtmp_start_d = toolkit_datetime_picker(
        function()
        {
          return comment.start_d;
        },
        function(new_text)
        {
          new_text = new_text.replace(/T.*/, '');
          updater.set(
            [
              [ "start_d", new_text ],
            ],
            function()
            {
              comment.start_d = new_text;
              dtmp_start_d.update();
            }
          );
        }
      );
      td.appendChild(dtmp_start_d.element());
      tr.appendChild(td);

      td = document.createElement("td");
      td.style.setProperty("border-left", "1px solid rgb(255, 0, 0)");
      td.style.setProperty("font-size", "9pt");
      td.style.setProperty("padding", "3px 3px 3px 10px");
      td.style.setProperty("text-align", "center");
      td.style.setProperty("width", "100px");
      var label_hms_start_t = toolkit_label_hms(
        function ()
        {
          return comment.start_t;
        },
        function (text)
        {
          updater.set(
            [
              [ "start_t", text ],
            ],
            function()
            {
              comment.start_t = text;
              label_hms_start_t.update();
            }
          );
        }
      );
      td.appendChild(label_hms_start_t.element());
      tr.appendChild(td);

      td = document.createElement("td");
      td.style.setProperty("border-left", "1px solid rgb(255, 0, 0)");
      td.style.setProperty("font-size", "9pt");
      td.style.setProperty("padding", "0px 15px");

      var lbl_hm_min = toolkit_label_hm(
        function ()
        {
          return comment.min;
        },
        function (text)
        {
          updater.set(
            [
              [ "min", text ],
            ],
            function()
            {
              comment.min = text;
              lbl_hm_min.update();
            }
          );
        }
      );

      td.appendChild(lbl_hm_min.element());
      tr.appendChild(td);

      tbl.appendChild(tr);
    }

    tr = document.createElement("tr");

    td = document.createElement("td");

    if (comment.type == 1)
    {
      td.setAttribute("colspan", "3");

      td.style.setProperty("border-style", "solid");
      td.style.setProperty("border-width", "1px 0px 0px");
      td.style.setProperty("border-top", "1px solid rgb(255, 0, 0)");
    }

    td.style.setProperty("padding", "5px");
    var memo_comment = toolkit_memo_create(
      function ()
      {
        return comment.comment;
      },
      function (t)
      {
        updater.set(
          [
            [ "comment", t ],
          ],
          function()
          {
            comment.comment = t;
            memo_comment.update();
          }
        );
      }
    );
    td.appendChild(memo_comment.element());
    tr.appendChild(td);

    tbl.appendChild(tr);

    tr = document.createElement("tr");

    td = document.createElement("td");

    if (comment.type == 1)
      td.setAttribute("colspan", "3");

    td.className = "comment-bottom";

    if (comment.source_id != "1")
    {
      var cln = comment.type == 1 ? "logwork" : "comment";
      span = document.createElement("span");
      span.className = "comment-bottom-span comment-bottom-span-" + cln;
      span.setAttribute("title", "imported from \"" + comment.sources_name + "\".");
      span.appendChild(document.createTextNode(comment.sources_name));
      td.appendChild(span);
    }

    tr.appendChild(td);

    tbl.appendChild(tr);

    return tbl;
  },
  left_right: function(cmp)
  {
    var table = document.createElement("table");

    table.setAttribute("border", "0");

    var tr = document.createElement("tr");

    var td_tvt = document.createElement("td");

    td_tvt.style.setProperty("vertical-align", "top");
    td_tvt.style.setProperty("width", "32%");

    tr.appendChild(td_tvt);

    var td = document.createElement("td");

    td.setAttribute("id", "task");

    td.style.setProperty("vertical-align", "top");

    tr.appendChild(td);

    table.appendChild(tr);

    avgproject.tree_view_tasks(td_tvt, td, 50, cmp);

    return table;
  },
  task_ws: function(task, item, opts)
  {
    while (task.firstChild)
      task.removeChild(task.firstChild);

    var lbl_title = toolkit_label(
      function()
      {
        return item.title;
      },
      function(new_text)
      {
        post_request().set(
          [
            [ "action", 3        ],
            [ "id",     item.id  ],
            [ "title",  new_text ],
          ],
          function (r)
          {
            item.title = new_text;
            lbl_title.update();
            if (opts.task_title_update)
              opts.task_title_update();
          }
        );
      }
    );
    task.appendChild(lbl_title.element());

    task.appendChild(document.createElement("br"));
    task.appendChild(document.createElement("br"));

    task.appendChild(avgproject.toolbar(
      [
        [
          "comment",
          function()
          {
            var comment = {
              comment: "comment text"
            };

            post_request().set(
              [
                [ "action",   5                ],
                [ "task_id",  item.id          ],
                [ "comment",  comment.comment  ],
                [ "type",     2                ],
              ],
              function (r)
              {
                var resp;

                eval("resp = " + r.responseText);

                if (!resp.data_set)
                {
                  alert(
                    "no data_set!\n" +
                    r.responseText
                  );
                  return;
                }

                task.appendChild(document.createElement("br"));

                var el = resp.data_set.body[0];

                task.appendChild(avgproject.comment(el));
              }
            );
          }
        ],
        [
          "log work",
          function()
          {
            var comment = {
              comment: "text",
              min:     60,
            };

            post_request().set(
              [
                [ "action",   5                ],
                [ "task_id",  item.id          ],
                [ "comment",  comment.comment  ],
                [ "min",      comment.min      ],
                [ "type",     1                ],
              ],
              function (r)
              {
                var resp;

                eval("resp = " + r.responseText);

                if (!resp.data_set)
                {
                  alert(
                    "no data_set!\n" +
                    r.responseText
                  );
                  return;
                }

                task.appendChild(document.createElement("br"));

                var el = resp.data_set.body[0];

                task.appendChild(avgproject.comment(el));
              }
            );
          }
        ],
        [
          "close",
          function()
          {
            alert("close \"" + item.title + "\"!");
          }
        ],
      ]
    ));

    task.appendChild(document.createElement("br"));

    function create_tr(tbl, text, node)
    {
      var tr, td;

      tr = document.createElement("tr");

      td = document.createElement("td");
      td.className = "task_field";
      td.appendChild(document.createTextNode(text));
      tr.appendChild(td);

      td = document.createElement("td");
      td.className = "task_field";

      for (var i = 0; i < node.length; ++i)
      {
        td.appendChild(node[i]);
      }

      tr.appendChild(td);

      tbl.appendChild(tr);
    }

    var tbl = document.createElement("table");

    create_tr(tbl, "ID:", [
      document.createTextNode(item.id)
    ]);

    create_tr(tbl, "Parent ID:", [
      document.createTextNode(item.parent_id)
    ]);

    var dtmp_created = toolkit_datetime_picker(
      function()
      {
        return item.dtm_created.replace(" ", "T");
      },
      function(new_text)
      {
        new_text = new_text.replace("T", " ");
        item.dtm_created = new_text;
        dtmp_created.update();
      }
    );

    create_tr(tbl, "Дата создания:", [ dtmp_created.element() ]);

    create_tr(tbl, "Приоритет:", [
      document.createTextNode(
        item.priority ? dtm_fmt_def(
          new Date(item.priority.replace(" ","T"))
        ) : ""
      )
    ]);

    task.appendChild(tbl);

    var memo_desc = toolkit_memo_create(
      function()
      {
        return item.description;
      },
      function(v)
      {
        post_request().set(
          [
            [ "action",      3       ],
            [ "id",          item.id ],
            [ "description", v       ],
          ],
          function ()
          {
            item.description = v;
            memo_desc.update();
          }
        );
      }
    );

    task.appendChild(memo_desc.element());

    post_request().set(
      [
        [ "action",   6        ],
        [ "task_id",  item.id  ],
      ],
      function (r)
      {
        var resp;

        eval("resp = " + r.responseText + ";");

        var arr = resp.data_set.body;

        task.appendChild(document.createElement("br"));

        task.appendChild(document.createTextNode("Коментарии " + arr.length + " штук."));

        task.appendChild(document.createElement("br"));

        for (var i = 0; i < arr.length; ++i)
        {
          var el = arr[i];

          task.appendChild(document.createElement("br"));

          task.appendChild(avgproject.comment(el));
        }
      }
    );
  },
  toolbar: function (arr)
  {
    var tbl = document.createElement("table");

    var tr = document.createElement("tr");

    for (var i = 0; i < arr.length; ++i)
    {
      var td = document.createElement("td");

      var text = arr[i][0];

      var btn = document.createElement("button");

      btn.style.setProperty("background-color", "rgb(215, 240, 255)");
      btn.style.setProperty("border", "0px none");
      btn.style.setProperty("color", "rgb(0, 118, 189)");
      btn.style.setProperty("cursor", "pointer");
      btn.style.setProperty("padding", "4px 40px");

      btn.addEventListener("click", arr[i][1]);

      btn.appendChild(document.createTextNode(text));

      td.appendChild(btn);

      tr.appendChild(td);
    }

    tbl.appendChild(tr);

    return tbl;
  },
  tree_view_tasks: function(container, task_ws, offset_step, cmp)
  {
    var tasks;

    function append_nodes(tree_node)
    {
      for ( var i = tree_node.first; i; i = i.next)
      {
        if (i.parent.id == 0)
          i.offset = 0;
        else
          i.offset = tree_node.offset + offset_step;

        var html_element = new_tv_node(i);

        i.html_element = html_element;

        container.appendChild(html_element);

        if (i.first)
          append_nodes(i);
      }
    }

    function new_tv_node(tree_node)
    {
      var s;
      var title;

      var newtask_click =
        function(e)
        {
          var new_node =
            {
              parent_id: tree_node.id
            }
          ;

          if (tree_node.id == 0)
          {
            new_node.title        = "Проект";
            new_node.description  = "Описание проекта.";
            new_node.type         = node_type.project;
            new_node.offset       = 0;
          }
          else
          {
            new_node.title        = "задача";
            new_node.description  = "Описание задачи.";
            new_node.type         = node_type.task;
            new_node.offset       = tree_node.offset + offset_step;
          }

          new_node.priority = "";

          post_request().set(
            [
              [ "action",       "2"                  ],
              [ "parent_id",    new_node.parent_id   ],
              [ "title",        new_node.title       ],
              [ "description",  new_node.description ],
              [ "type",         new_node.type        ],
            ],
            function (r)
            {
              var resp;

              var cmd = "resp = " + r.responseText + ";";

              eval(cmd);

              if (!resp.id) // Произошла ошибка во время добавления на сервере
                return;

              new_node.id           = resp.id;
              new_node.dtm_created  = resp.dtm_created;

              tree_store_add(tasks, tree_node, new_node, cmp);

              var html_element = new_tv_node(new_node);

              new_node.html_element = html_element;

              var bn = tree_store_get_bottom_node(new_node);

              bn.html_element.parentNode.insertBefore(html_element, bn.html_element);
            }
          );

          e.preventDefault();
        }
      ;

      var project_click;

      var a_href_title;

      if (tree_node.id == 0)
      {
        s = "p";
        title = "+[ADD]";
        project_click = newtask_click;
      }
      else
      {
        switch (tree_node.type)
        {
          case node_type.project:
            s = "p";
            break;
          case node_type.task:
            s = "t";
            break;
          default:
            s = "p";
            break;
        }
        title = tree_node.title + " (" + tree_node.id + ", " + tree_node.parent_id + ")";
        project_click = function(e)
        {
          avgproject.task_ws(task_ws, tree_node,
            {
              task_title_update: function()
              {
                while (a_href_title.firstChild)
                  a_href_title.removeChild(a_href_title.firstChild);
                a_href_title.appendChild(document.createTextNode(tree_node.title));
              }
            }
          );

          e.preventDefault();
        }
      }

      var task_style        = "task_" + s;
      var task_btn_style    = "task_btn_" + s;

      var table = document.createElement("table");

      table.setAttribute("border", "0");

      var tr = document.createElement("tr");

      var td = document.createElement("td");

      td.setAttribute("width", tree_node.offset ? tree_node.offset : 0 );

      td.appendChild(document.createTextNode("\xA0"));

      tr.appendChild(td);

      td = document.createElement("td");

      td.setAttribute("class", "task " + task_style);

      a_href_title = document.createElement("a");

      a_href_title.addEventListener("click", project_click);

      a_href_title.setAttribute("class", "task_btn " + task_btn_style);

      a_href_title.setAttribute("href", tree_node.id);

      a_href_title.appendChild(document.createTextNode(title));

      td.appendChild(a_href_title);

      if (tree_node.id > 0)
      {
        td.appendChild(document.createElement("br"));

        var a_href_subt = document.createElement("a");

        a_href_subt.addEventListener("click", newtask_click);

        a_href_subt.setAttribute("href", tree_node.id);

        a_href_subt.setAttribute("class", "task_btn task_btn_s");

        a_href_subt.appendChild(document.createTextNode("(new subtask)"));

        td.appendChild(a_href_subt);
      }

      tr.appendChild(td);

      table.appendChild(tr);

      return table;
    }

    post_request().set(
      [
        [ "action", 1 ],
      ],
      function (r)
      {
        var tasks_nodes;

        eval("tasks_nodes = [\n" + r.responseText + "\n];");

        tasks = tree_store_build_tree(tasks_nodes, cmp);

        /*
          Вообще, функция "tree_store_build_tree"  всегда  завершается  успешно,  за
          исключением случаев когда остаются элементы для которых parent_node  найти
          не удалось. Поэтому нужно будет сделать обработку этого случая когда будет
          время.
        */

        append_nodes(tasks);

        var html_element = new_tv_node(tasks);

        tasks.html_element = html_element;

        container.appendChild(html_element);
      }
    );
  },
};

/* vim: set expandtab ts=2 : */
