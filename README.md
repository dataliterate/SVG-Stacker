SVG Stacker
===========

An experimental tool that turns a folder of SVG files into a single SVG Stack.
It also creates some demo HTML files that use the stack with different embedding-techniques (iframe, embed, img, object, background-image).

SVG Stacker is based on NODE.js.

The project contains three example stacks based icons of the famous [Tango Icon Library](http://tango.freedesktop.org/Tango_Icon_Library), the popular [Iconic icon set by P.J. Onori](http://somerandomdude.com/work/iconic/) and files from wikipedia.

I created SVG Stacker to explore the power of the SVG Stack concept and test filesize, performance and browser-support.

Example Stacks
-----------
* [Different Sizes, all embed techniques](http://preciousforever.github.com/SVG-Stacker/examples/wikipedia/commons/stack/stack-demo-all.html)
* [Tango Device Icons, embedded as background image](http://preciousforever.github.com/SVG-Stacker/examples/tango-icon-theme/devices/stack/stack-demo-background.html) (Firefox only)

**with Webkit fix**:

* [IMG and style-attribute fix](http://preciousforever.github.com/SVG-Stacker/examples/wikipedia/commons/stack/stack-demo-jsfix.html)
* [CSS Hack](http://preciousforever.github.com/SVG-Stacker/examples/wikipedia/commons/stack/stack-demo-css-hack.html)

About SVG Stacks
-----------

Simon 'Simurai' first described 'SVG Stacks' in March 2012. It's a technique to stack different SVG objects into one file to save HTTP Requests.

> First we give each of our icons in the SVG file a unique ID and the same class name, add some CSS to hide all icons and only display the one that gets selected with :target. And now we can use a hash in the URL to pass the ID into the SVG file, like background: url(icon.svg#ID).

[Read Simons blog post](http://simurai.com/post/20251013889/svg-stacks). Simon also created a [SVG Stack demo](http://jsfiddle.net/simurai/7GCGr/) that works pretty well in Firefox, but not yet in Webkit, see ([Webkit-Bug](https://bugs.webkit.org/show_bug.cgi?id=91790)).

The ':target'-technique was first introduced by [@erikdahlstrom](https://twitter.com/erikdahlstrom) – it's worth checking out his [SVG Code snippets](http://xn--dahlstrm-t4a.net/svg/).

Wekit Fix
-----------
Read [annotated source](http://preciousforever.github.com/SVG-Stacker/docs/fixsvgstack.jquery.html).

Background
-----------

We decided to work with SVG for a recent mobile website project. It is an open standard, it is [widly supported by browsers](http://caniuse.com/#search=svg) and leads to great visual results, especially when it comes to devices with different pixel densities.

**"SVG-Stacks are the new Imagesprites." – Are they?**

There are pros and cons. Here is a list of things we thought about so far and would like to discuss:

1.  Support for colors

    compared to monocromatic icons, that can be easily embedded with Webfonts

2.  Easier to write and _read_ in CSS

    ```
    button.cart {
      background: transparent url(stack.svg#cart) no-repeat top left;
    }
    ```

    compared to

    ```
    [data-icon]:before {
        font-family: 'IcoMoon';
        content: attr(data-icon);
    }
    <a href="#" class="button-with-icon" data-icon="+">Add</a>
    ```

    Webfont icon embed

    Webfonts are great for monochrome icons. [Icomoon](http://keyamoon.com/icomoon/app/) is a great tool to define icon sets and add custom svg objects.
     One could argue that they causes some semantic issues as they always produce content (compared to decorative background-image), which might be OK when using Unicodes [Private Use Area](http://en.wikipedia.org/wiki/Private_Use_(Unicode)).

     But for Developers it might feel more natural to work with SVG Stacks as


3.  SVG Stacks behave like raster-images 

    ```
    <img src="stack.svg#flowers">
    ```

    They can be treat in HTML and CSS like we used to treat raster images.

4.  Animation

    See soccer-ball in [Wikipedia Example](http://preciousforever.github.com/SVG-Stacker/examples/wikipedia/commons/stack/stack-demo-all.html)

5.  (Not) yet available on Webkit

    There is a [Webkit-Bug](https://bugs.webkit.org/show_bug.cgi?id=91790) that needs to be fixed to make SVG Stacks work.
    
    **Update** For now I created a jQuery Plugin to fix SVG Stacks for Webkit. See Webkit Fix above.

6.  Slow?

    Test the examples: Some browser need an extensive rendering time.