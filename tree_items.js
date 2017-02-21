
var node_type = {
  project: 1,
  task: 2,
};

var node_type_str = {
  1: "project",
  2: "task",
};

function tree_store_add(tree, parent_node, new_node, cmp)
{
  var next;

  if (cmp)
  {
    for (next = parent_node.first; next; next = next.next)
      if (!cmp(new_node,next))
        break;
  }
  else
    next = null;

  if (next)
  {
    prev = next.prev;
    next.prev = new_node;
  }
  else
  {
    prev = parent_node.last;
    parent_node.last = new_node;
  }

  if (prev)
    prev.next = new_node;
  else
    parent_node.first = new_node;

  new_node.prev = prev;
  new_node.next = next;

  new_node.parent = parent_node;

  eval("tree.items.item_" + new_node.id + " = new_node;");

  return prev;
}

function tree_store_unlink(begin, end)
{
  var par  = begin.parent;

  var prev = begin.prev;

  var next = end.next;

  if (prev)
    prev.next = next;
  else
    par.first = next;

  if (next)
    next.prev = prev;
  else
    par.last  = prev;

  begin.prev = null;
  end.next = null;
}

function tree_store_build_tree(tree_items, cmp)
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
    items: { },
    title: "[root]",
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
        tree_store_add(b_tree, bt_parent_node, nbtn, cmp);

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
