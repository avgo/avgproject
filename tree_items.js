
var node_type = {
  project: 1,
  task: 2,
};

var node_type_str = {
  1: "project",
  2: "task",
};

function gen_html_for_node(i)
{
    var task_style;
    var task_btn_style;

    switch (i.type)
    {
      case node_type.project:
        task_style        = "task_p";
        task_btn_style    = "task_btn_p";
        break;
      case node_type.task:
        task_style        = "task_t";
        task_btn_style    = "task_btn_t";
        break;
      default:
        break;
    }

    return (
      "<tr>\n" +
      "<td width=" + i.offset + ">&nbsp;</td>\n" +
      "<td class=\"task " + task_style + "\">" +

      "<span " +
        "class=\"task_btn " + task_btn_style + "\" " +
        "onclick=\"projects_tree_item_project_click(app.items.item_" + i.id + ");\"" +
      ">" +
        i.title + " (" + i.id + ", " + i.parent_id + ")" +
      "</span>\n" +
      "<br>\n" +

      "<span " +
        "class=\"task_btn task_btn_s\" " +
        "onclick=\"projects_tree_item_new_subt_click(app.items.item_" + i.id + ");\"" +
      ">" +
        "(new subtask)" +
      "</span>" +
      "<br>\n" +

      "</td>" +
      "</tr>\n"
    );
}

function tree_store_add(parent_node, new_node)
{
  var prev = null; var node = null;

  for (node = parent_node.first; node; node = node.next)
  {
    /*
    if (new_node.id >= node.id)
      break;
    */
    prev = node;
  }

  if (prev)
    prev.next = new_node;
  else
    parent_node.first = new_node;

  new_node.next    = node;
  new_node.parent  = parent_node;

  return prev;
}

function tree_store_build_tree(tree_items)
{
  /*
      Массив на самом деле делится на две части: в верхней части уже
      готовое дерево (доступное из b_tree), а в нижней части ещё не разобранные его
      элементы (доступные из nb_tree).
      Надо разбирать дерево, постепенно перемещая элементы в верхнюю часть.
      Ну, или другими словами, корректно расставить ссылки, чтобы сформировать
      дерево, которое можно будет удобно обходить рекурсивным алгоритмом.
  */

  var b_tree = {
    id: 0,
    title: "[root]"
  };

  if (tree_items.length == 0)
    return b_tree;

  for (var i = 0, j = 1; j < tree_items.length; ++i, ++j)
  {
    var f = tree_items[i];
    var s = tree_items[j];

    f.next = s;
  }

  var nb_tree = {
    first: tree_items[0],
  };

  while ( nb_tree.first )
  {
    var count_before = 0;

    for (var nbtn = nb_tree.first; nbtn; nbtn = nbtn.next)
      ++count_before;

    var nbtn_prev = null;

    for (var nbtn = nb_tree.first; nbtn; nbtn = nbtn_next)
    {
      var nbtn_next = nbtn.next;

      var bt_parent_node = tree_store_search_by_id(b_tree, nbtn.parent_id);

      if (bt_parent_node)
      {
        tree_store_add(bt_parent_node, nbtn);

        // отвязать nbtn от старого места

        if (nbtn_prev)
          nbtn_prev.next = nbtn_next;
        else
          nb_tree.first = nbtn_next;
      }
      else
      {
        nbtn_prev = nbtn;
      }
    }

    var count_after = 0;

    for (var nbtn = nb_tree.first; nbtn; nbtn = nbtn.next)
      ++count_after;

    if (count_before == count_after)
    {
      var msg = "Не получается пристроить в дерево следующие элементы:\n";

      for (var nbtn = nb_tree.first; nbtn; nbtn = nbtn.next)
      {
        msg +=
            "id: " + nbtn.id +
            ", parent_id: " + nbtn.parent_id +
            ", title: \"" + nbtn.title + "\"\n";
      }

      alert(msg);

      return;
    }
  }

  return b_tree;
}

function tree_store_get_bottom_node(node)
{
  var prev;

  do
  {
    if (node.next)
      return node.next;

    prev = node;

    node = node.parent;
  }
  while (node);

  return prev;
}

function tree_store_get_new_id(node, id)
{
  for (var i = node.first; i; i = i.next)
  {
    if (i.id >= id)
      id = i.id + 1;

    if (i.first)
      id = tree_store_get_new_id(i, id);
  }

  return id;
}

function tree_store_html_gen(elem, b_tree, ctx)
{
  var args = {
    html: "",
    offset: 0,
    ctx: ctx
  };

  tree_store_html_gen2(b_tree, args);

  args.html +=
    "<table border=\"0\" id=\"table_item_0\">\n" +
    "<tr>\n" +
    "<td width=" + args.offset + ">&nbsp;</td>\n" +
    "<td class=\"task task_p\">" +
    "<span class=\"task_btn task_btn_p\" onclick=\"projects_tree_item_new_subt_click(app.tasks);\">+[ADD]</span><br>\n" +
    "</td>" +
    "</tr>\n" +
    "</table>\n"
  ;

  elem.innerHTML = args.html;
}

function tree_store_html_gen2(b_tree, args)
{
  for (var i = b_tree.first; i; i = i.next)
  {
    i.offset = args.offset;

    eval("args.ctx.item_" + i.id + " = i;");

    args.html +=
      "<table id=\"table_item_" + i.id + "\" border=\"0\">\n" +
      gen_html_for_node(i) +
      "</table>\n"
    ;

    if (i.first)
    {
      args.offset += args.ctx.offset_step;

      tree_store_html_gen2(i, args);

      args.offset -= args.ctx.offset_step;
    }
  }
}

function tree_store_search_by_id(b_tree, id)
{
  if (id == 0)
    return b_tree;

  if (!b_tree.first)
    return ;

  for (var i = b_tree.first; i; i = i.next)
  {
    if (i.id == id)
      return i;

    if (i.first)
    {
      var r = tree_store_search_by_id(i, id);

      if (r)
        return r;
    }
  }
}

/* vim: set expandtab ts=2 : */
