function days_in_month(y,m)
{
  if (m == 4 || m == 6 || m == 9 || m == 11)
    return 30;
  else
  if (m == 2)
  {
    if (y % 4)
      return 28;
    else
      return 29;
  }
  else
  if (m < 1 || 12 < m)
    ;
  else
    return 31;
}

function elem_coords(e) {
  var box = e.getBoundingClientRect();

  var body = document.body;
  var de = document.documentElement;

  var scrollTop = window.pageYOffset || de.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || de.scrollLeft || body.scrollLeft;

  var clientTop = de.clientTop || body.clientTop || 0;
  var clientLeft = de.clientLeft || body.clientLeft || 0;

  var top = box.top + scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return {
    top: top,
    left: left
  };
}

function for_each_sibling(parent, f, arg)
{
  f(parent, arg); for_each_sibling_s(parent,f,arg);
}

function for_each_sibling_s(parent, f, arg)
{
  for (var i = parent.first; i; i = i.next)
  {
    f(i); for_each_sibling_s(i,f,arg);
  }
}

function min_max_check(el,min,max)
{
  el.value = el.value.replace(/[^0-9]/g, '');

  if (el.value == "")
    el.value = min;

  if (el.value > max)
    el.value = max;

  if (el.value < min)
    el.value = min;
}

function pad(n)
{
  if (n < 10)
    return "0" + n;
  else
    return n;
}

function toolkit_datetime_picker(get_value, set_value)
{
  var calendar;

  var current_value;

  var el_button;

  var el_main;

  var popup_win;

  var pick_year;
  var pick_month;
  var pick_day;
  var pick_hours;
  var pick_minutes;
  var pick_seconds;

  function create()
  {
    if (get_value)
    {
      var v = get_value();

      current_value = v ? new Date(v) : new Date();
    }

    if (!current_value) current_value = new Date();

    el_main = document.createElement("span");

    el_button = document.createElement("button");

    el_button.style.setProperty("border-width", "0px");
    el_button.style.setProperty("background-color", "transparent");
    el_button.style.setProperty("cursor", "pointer");
    el_button.style.setProperty("padding", "0");

    el_main.appendChild(el_button);

    el_button.addEventListener("click",
      function()
      {
        var c = elem_coords(el_main);

        popup_win.style.setProperty("display", "block");
        popup_win.style.setProperty("left", c.left + "px");
        popup_win.style.setProperty("top",
          (c.top + el_main.offsetHeight) + "px"
        );

        pick_year.value     = current_value.getFullYear();
        pick_month.value    = current_value.getMonth() + 1;
        pick_day.value      = current_value.getDate();
        pick_hours.value    = current_value.getHours();
        pick_minutes.value  = current_value.getMinutes();
        pick_seconds.value  = current_value.getSeconds();

        update_calendar();
      }
    );

    update_btn_value();

    popup_win = document.createElement("div");

    popup_win.className = "toolkit_dtm_picker";

    var btn_close = document.createElement("input");

    btn_close.className  = "toolkit_small_button";
    btn_close.type       = "button";
    btn_close.value      = "close";

    btn_close.addEventListener("click",
      function()
      {
        popup_win.style.setProperty("display", "none");
      }
    );

    popup_win.appendChild(btn_close);

    var btn_set = document.createElement("input");

    btn_set.className  = "toolkit_small_button";
    btn_set.type       = "button";
    btn_set.value      = "set";

    btn_set.addEventListener("click",
      function()
      {
        if (set_value)
        {
          set_value(
            pad(pick_year.value) + "-" +
            pad(pick_month.value) + "-" +
            pad(pick_day.value) + "T" +
            pad(pick_hours.value) + ":" +
            pad(pick_minutes.value) + ":" +
            pad(pick_seconds.value)
          );

          if (get_value)
          {
            var v = get_value();

            current_value = v ? new Date(v) : new Date();
          }

          if (!current_value) current_value = new Date();

          update_btn_value();
        }

        popup_win.style.setProperty("display", "none");
      }
    );

    popup_win.appendChild(btn_set);

    popup_win.appendChild(document.createElement("br"));

    pick_year = document.createElement("input");

    pick_year.type = "text";
    pick_year.value = "YYYY";
    pick_year.style.setProperty("width", "45px");
    pick_year.style.setProperty("text-align", "center");
    pick_year.addEventListener("wheel",
      function(ev)
      {
        ev.preventDefault();

        min_max_check(pick_year,0,9999);

        if (ev.deltaY < 0 && pick_year.value < 9999)
          ++pick_year.value;
        else
        if (ev.deltaY > 0 && pick_year.value > 0)
          --pick_year.value;

        day_correction();
        update_calendar();
      }
    );
    pick_year.addEventListener("input",
      function ()
      {
        min_max_check(pick_year,0,9999);
        day_correction();
        update_calendar();
      }
    );

    popup_win.appendChild(pick_year);

    popup_win.appendChild(document.createTextNode("-"));

    pick_month = document.createElement("input");

    pick_month.type = "text";
    pick_month.value = "MM";
    pick_month.style.setProperty("width", "30px");
    pick_month.style.setProperty("text-align", "center");
    pick_month.addEventListener("wheel",
      function(ev)
      {
        ev.preventDefault();

        var y = pick_year.value;
        var m = pick_month.value;

        var t = y*12+(m-1);
        var t_max = (9999-0+1) * (12-1+1);

        if (ev.deltaY < 0 && t < t_max)
          ++t;
        else
        if (ev.deltaY > 0 && t > 0)
          --t;

        y = Math.floor(t / 12);
        m = t % 12 + 1;

        pick_year.value   = y;
        pick_month.value  = m;

        day_correction();
        update_calendar();
      }
    );
    pick_month.addEventListener("input",
      function ()
      {
        min_max_check(pick_month,1,12);
        day_correction();
        update_calendar();
      }
    );

    popup_win.appendChild(pick_month);

    popup_win.appendChild(document.createTextNode("-"));

    pick_day = document.createElement("input");

    pick_day.type = "text";
    pick_day.value = "DD";
    pick_day.style.setProperty("width", "30px");
    pick_day.style.setProperty("text-align", "center");
    pick_day.addEventListener("wheel",
      function(ev)
      {
        ev.preventDefault();

        var dtm = new Date(
            pick_year.value,
            pick_month.value-1,
            pick_day.value
        );

        if (ev.deltaY < 0)
          dtm.setTime(dtm.getTime() + 24*60*60*1000);
        else
        if (ev.deltaY > 0)
          dtm.setTime(dtm.getTime() - 24*60*60*1000);

        pick_year.value   = dtm.getFullYear();
        pick_month.value  = dtm.getMonth() + 1;
        pick_day.value    = dtm.getDate();

        update_calendar();
      }
    );
    pick_day.addEventListener("input",
      function ()
      {
        day_correction();
        update_calendar();
      }
    );

    popup_win.appendChild(pick_day);

    popup_win.appendChild(document.createTextNode(" "));

    pick_hours = document.createElement("input");

    pick_hours.type = "text";
    pick_hours.value = "HH";
    pick_hours.style.setProperty("width", "30px");
    pick_hours.style.setProperty("text-align", "center");
    pick_hours.addEventListener("wheel",
      function(ev)
      {
        ev.preventDefault();

        var dtm = new Date(
            pick_year.value,
            pick_month.value-1,
            pick_day.value,
            pick_hours.value
        );

        if (ev.deltaY < 0)
          dtm.setTime(dtm.getTime() + 60*60*1000);
        else
        if (ev.deltaY > 0)
          dtm.setTime(dtm.getTime() - 60*60*1000);

        pick_year.value   = dtm.getFullYear();
        pick_month.value  = dtm.getMonth() + 1;
        pick_day.value    = dtm.getDate();
        pick_hours.value  = dtm.getHours();

        update_calendar();
      }
    );
    pick_hours.addEventListener("input",
      function ()
      {
        min_max_check(pick_hours, 0, 23);
        update_calendar();
      }
    );

    popup_win.appendChild(pick_hours);

    popup_win.appendChild(document.createTextNode(":"));

    pick_minutes = document.createElement("input");

    pick_minutes.type = "text";
    pick_minutes.value = "MM";
    pick_minutes.style.setProperty("width", "30px");
    pick_minutes.style.setProperty("text-align", "center");
    pick_minutes.addEventListener("wheel",
      function(ev)
      {
        ev.preventDefault();

        var dtm = new Date(
            pick_year.value,
            pick_month.value-1,
            pick_day.value,
            pick_hours.value,
            pick_minutes.value
        );

        if (ev.deltaY < 0)
          dtm.setTime(dtm.getTime() + 60*1000);
        else
        if (ev.deltaY > 0)
          dtm.setTime(dtm.getTime() - 60*1000);

        pick_year.value     = dtm.getFullYear();
        pick_month.value    = dtm.getMonth() + 1;
        pick_day.value      = dtm.getDate();
        pick_hours.value    = dtm.getHours();
        pick_minutes.value  = dtm.getMinutes();

        update_calendar();
      }
    );
    pick_minutes.addEventListener("input",
      function ()
      {
        min_max_check(pick_minutes, 0, 59);
        update_calendar();
      }
    );

    popup_win.appendChild(pick_minutes);

    popup_win.appendChild(document.createTextNode(":"));

    pick_seconds = document.createElement("input");

    pick_seconds.type = "text";
    pick_seconds.value = "SS";
    pick_seconds.style.setProperty("width", "30px");
    pick_seconds.style.setProperty("text-align", "center");
    pick_seconds.addEventListener("wheel",
      function(ev)
      {
        ev.preventDefault();

        var dtm = new Date(
            pick_year.value,
            pick_month.value-1,
            pick_day.value,
            pick_hours.value,
            pick_minutes.value,
            pick_seconds.value
        );

        if (ev.deltaY < 0)
          dtm.setTime(dtm.getTime() + 1000);
        else
        if (ev.deltaY > 0)
          dtm.setTime(dtm.getTime() - 1000);

        pick_year.value     = dtm.getFullYear();
        pick_month.value    = dtm.getMonth() + 1;
        pick_day.value      = dtm.getDate();
        pick_hours.value    = dtm.getHours();
        pick_minutes.value  = dtm.getMinutes();
        pick_seconds.value  = dtm.getSeconds();

        update_calendar();
      }
    );
    pick_seconds.addEventListener("input",
      function ()
      {
        min_max_check(pick_seconds, 0, 59);
        update_calendar();
      }
    );

    popup_win.appendChild(pick_seconds);

    popup_win.appendChild(document.createElement("br"));

    calendar = document.createElement("span");

    popup_win.appendChild(calendar);

    el_main.appendChild(popup_win);
  }

  function day_correction()
  {
    min_max_check(pick_day, 1, days_in_month(
      pick_year.value,
      pick_month.value
    ));
  }

  function update_btn_value()
  {
    var d = current_value;
    var b = el_button;

    while (b.firstChild)
      b.removeChild(b.firstChild);

    b.appendChild(document.createTextNode(
      pad(d.getDate()) + "." +
      pad(d.getMonth()+1) + "." +
      pad(d.getFullYear()) + ", " +
      pad(d.getHours()) + ":" +
      pad(d.getMinutes()) + ":" +
      pad(d.getSeconds())
    ));
  }

  function update_calendar()
  {
    while (calendar.firstChild)
      calendar.removeChild(calendar.firstChild);

    var t = document.createElement("table");

    t.border = 0;

    var pick_y = parseInt(pick_year.value, 10);
    var pick_m = parseInt(pick_month.value, 10);
    var pick_d = parseInt(pick_day.value, 10);

    var w_d_labels = [ "пн", "вт", "ср", "чт", "пт", "сб", "вс" ];

    var tr, td;

    tr = document.createElement("tr");

    for (var i = 0; i < 7; ++i)
    {
      td = document.createElement("td");
      td.appendChild(document.createTextNode(w_d_labels[i]));
      tr.appendChild(td);
    }

    t.appendChild(tr);

    dtm = new Date(pick_y,pick_m-1,1);

    calendar.appendChild(document.createElement("br"));

    // (a-1+max+b)%max+1

    // b=-1, max=12, (a+10)%12+1

    var prev_month = (pick_m + 10) % 12 + 1;

    var cur_month = prev_month;
    var cur_year = cur_month == 12 ? pick_y - 1 : pick_y;
    var cur_dim = days_in_month(cur_year, cur_month);

    var cur_day = (cur_dim - (dtm.getDay()+6) % 7 - 7) % cur_dim + 1;

    for (var i = 0; i < 8; ++i)
    {
      tr = document.createElement("tr");

      for (var dow = 0; dow < 7; ++dow)
      {
        td = document.createElement("td");

        var btn = document.createElement("input");

        btn.type   = "button";
        btn.value  = cur_day;

        btn.style.setProperty("width","25px");
        btn.style.setProperty("text-align","right");

        if (pick_m == cur_month)
        {
          if (pick_d == cur_day)
            btn.style.setProperty("background-color","#FF7575");
          else
          if (dow == 5 || dow == 6)
            btn.style.setProperty("background-color","#FFCFCF");
          else
            btn.style.setProperty("background-color","#CFE7FF");
        }
        else
          btn.style.setProperty("background-color","#ffffff");

        btn.style.setProperty("border-width", "1px");
        btn.style.setProperty("padding", "0px 0px 0px 0px");

        btn.addEventListener("click", (function(y,m,d) {
          return function() {
            pick_year.value   = y;
            pick_month.value  = m;
            pick_day.value    = d;

            update_calendar();
          };
        })(cur_year,cur_month,cur_day));

        td.appendChild(btn);

        tr.appendChild(td);

        if (cur_day == cur_dim)
        {
          if (cur_month == 12)
          {
            cur_month = 1;
            ++cur_year;
          }
          else
            ++cur_month;

          cur_day = 1;
          cur_dim = days_in_month(cur_year, cur_month);
        }
        else
          ++cur_day;
      }

      t.appendChild(tr);
    }

    calendar.appendChild(t);
  }

  create();

  return el_main;
}

function toolkit_label(get_title, set_title)
{
  var el_button;

  var el_main;

  var el_text;

  var el_text_edit;

  var button_click_change = function()
  {
    var text = set_title(el_text_edit.value);

    while (el_text.firstChild)
      el_text.removeChild(el_text.firstChild);

    el_text.appendChild(document.createTextNode(text));

    while (el_button.firstChild)
      el_button.removeChild(el_button.firstChild);

    el_button.appendChild(document.createTextNode("edit"));

    el_button.removeEventListener("click", button_click_change);
    el_button.addEventListener("click", button_click_edit);
  }

  var button_click_edit = function()
  {
    while (el_text.firstChild)
      el_text.removeChild(el_text.firstChild);

    el_text_edit = document.createElement("input");

    el_text_edit.type = "text";

    el_text_edit.value = get_title();

    el_text_edit.addEventListener("keyup", function (event)
    {
      event.preventDefault();
      if (event.keyCode != 13)
        return;
      el_button.click();
    });

    el_text.appendChild(el_text_edit);

    el_text_edit.focus();

    el_text_edit.selectionStart  = 0;
    el_text_edit.selectionEnd    = el_text_edit.value.length;

    while (el_button.firstChild)
      el_button.removeChild(el_button.firstChild);

    el_button.appendChild(document.createTextNode("ok"));

    el_button.removeEventListener("click", button_click_edit);
    el_button.addEventListener("click", button_click_change);
  }

  function create()
  {
    el_main = document.createElement("span");

    el_text = document.createElement("span");

    el_text.appendChild(
      document.createTextNode(get_title())
    );

    el_main.appendChild(el_text);

    el_button = document.createElement("button");

    el_button.className = "toolkit_small_button";

    el_button.appendChild(document.createTextNode("edit"));

    el_button.addEventListener("click", button_click_edit);

    el_main.appendChild(el_button);
  }

  create();

  return el_main;
}

/* vim: set expandtab ts=2 : */
