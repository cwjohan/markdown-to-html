Something Really Cool
=========

Hello world github/linguist#1 **cool**, and #1!
And that is not all.

#Lists

##Numbered List

1. Item One
1. Item Two
1. Item Three

##Bullet List

* Item One
* Item Two
* Item Three

#Code Example

##Code enclosed in 'backquotes':

Always use `var` to define a variable. For example, `var baz = 'initial value';` would define
variable `baz`.

##This is some nonsense javascript code:

        var fs = require('fs');
        var count = 0, text;
        exports.bar = {
          boo: true,
          baz: 'Fred'
        };

        function foo(inc) {
          try {
            console.log("foo has been called");
            count = count + inc;
            if (count >= 10) {
              count = 0;
            } else {
              text = fs.readFileSync('foo.txt');
            }
          catch(err) {
            throw new Error('Help! ' + err);
          }
        }

#Fenced Javascript Code

```js    
var fs = require('fs');
var count = 0, text;
exports.bar = {
  boo: true,
  baz: 'Fred'
};

function foo(inc) {
  try {
    console.log("foo has been called");
    count = count + inc;
    if (count >= 10) {
      count = 0;
    } else {
      text = fs.readFileSync('foo.txt');
    }
  catch(err) {
    throw new Error('Help! ' + err);
  }
}
```

##Fenced Ruby Code

```ruby
require "bunny"

conn = Bunny.new(:hostname => "127.0.0.1", :port => 5672)
conn.start

ch = conn.create_channel
q = ch.queue("hello")

q.subscribe(:ack => true, :block => true,) do |delivery_info, properties, body|
    puts " [x] Received '#{body}'"
    # imitate some work
    sleep body.count(".").to_i
    puts " [x] Done"
    ch.ack(delivery_info.delivery_tag)
    if body == "stop"
        delivery_info.consumer.cancel
    end
end
```

##Fenced Coffeescript Code

```coffee
fs = require 'fs'
count = 0
text = null
exports.bar =
  boo: true
  baz: 'Fred'

foo = (inc) ->
  try
    console.log "foo has been called"
    count = count + inc
    if count >= 10
      count = 0
    else
      text = fs.readFileSync 'foo.txt'
  catch err
    throw new Error 'Help! ' + err
```

##Fenced Python Code

```py
def fib(n):
    if n > 1:
        return n * fib(n -1)
    else:
        return 1

if __name__ == '__main__':
    import sys
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    f = fib(n)
    print 'fib(', n, ') is ', f
```

#In Conclusion

You _can_ do it __too__!
Try to enclose `code` in *backquotes*.

