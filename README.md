Yes I used an AI Assistant in Jetbrains Webstorm. It was more of a debugging partner than anything. I wrote and structured through the JS stuff myself and when I got stuck I would ask questions to an AI overview. Really more than anything figuring out terminal error messages was the big AI job. 

I don't feel like the stuff I write is enterprise level. It feels basic and straightforward. I prefer Python and honestly kinda struggle with JS. My direct example of AI use would be when "nextId is not defined" I used an AI assistant to help me figure out pathways that were broken. I also don't download this into VScode and then use it and import it back. I just copy+paste into Webstorm. It is much more efficient. 

I chose to try and adhere to the old and maybe very outdated model of KISS (keep it simple stupid) when I wrote this. I want something modular that keeps the routers and controllers separated. Instead of making one big giant function that tries to do everything at once I tried to break it down into smaller steps using middleware. (Specifically for the controllers) Stuff like orderExists and validateOrderFields ended up being my way of making a ladder if you will of steps instead of everything being lumped together. To me it makes the code easier so everything handles one step and there isn't a huge need for notes pointing it out. I also used res.locals to hold onto data that was already found during the verification steps. That way the next handler can use it without having to search for the same thing again. It keeps me from repeating the same code in multiple places. I ended each route with .all(methodNotAllowed) as a hard stop for HTTP methods that aren't supposed to be used. More or less if someone tries to hit the route with an action that isn't allowed it gets shut down before it can do anything stupid to the data. 

Then heading over to routers... I really wanted to map this and in my head it made sense that its like an actual map. "Here do this, don't allow that, yes do that, this is okay", that was my thinking heading into this. So for example using Express router.route() chains instead of just dumping a bunch of really unclean stuff in the main application files. This kept all the URL paths cleaner and makes it easier to just look and know what each route is supposed to be doing. I hooked up standard web actions like get, post, put and delete to the controllers that handle each one. I also chained the .all(methodNotAllowed) onto the end of both paths. More or less this acts as a roadblock that way if someone tries to us an HTTP action that isn't allowed for that route it hits the 405 error and gets stopped instead of just continuing on its way and messing up the orders. 

Yay! Milestones!!!
**Milestone 1:** Getting the Routes Set Up

I started by getting orders.router.js and dishes.router.js wired up and basically made the URL map for everything. I also made sure every route ended with .all(methodNotAllowed) so anything using an HTTP method that isn't supposed to be there gets stopped.

**Milestone 2:** Getting the Dishes Working

I moved on to the dishes controller and built the checks for things like names, descriptions, and image links. I didn't want empty strings or someone just putting in a bunch of spaces to count as valid information.

I also added the price checks so the price has to be a whole number greater than zero. No accidental free meals on purpose, but maybe free meals if we're feeling generous. (bad joke)

From there I built the create, read, and update logic for dishes. I also made sure the existing ID couldn't just get changed when somebody updates the rest of the dish.

**Milestone 3:** Cleaning Up Data and Checking Orders

Once the dishes were working I moved over to the orders controller. I built the validation for things like addresses and phone numbers and used .trim() to clean up the text before checking it. That way somebody can't technically pass a required field just by entering a bunch of spaces.

I also had to deal with the dishes being inside another array in the order. I wrote a loop to go through each item and make sure every quantity is a whole number greater than zero. Which honestly feels like a bad way to do it, but I wasn't exactly sure of a better way. 

**Milestone 4:** Protecting the Order Status

After that I worked on the rules around what can actually happen to an order depending on its status. I locked it down so a delivered order can't just be changed after the fact.

I did the same thing with deleting orders. An order can only be completely deleted while it's still pending. Once it has moved past that point the delete doesn't get to happen.

**Milestone 5:** Debugging and Getting Everything to Play Nice

Then came the fun part... fighting with terminal errors in WebStorm.

I had some scope and import issues along the way like "nextId is not defined." I fixed those by going back through the imports and making sure everything was being pulled in from the right place.

I also changed some of the error handling to use return next() so that when something fails validation then the function stops right there instead of continuing down into the part where it would actually modify the data.

After getting everything working together I ran the final npm test rounds and ended up with a 100% passing score.

**Now Bugs... unfortunately**
How I Approached the Debugging Task

My approach to debugging was basically test it. See what broke. Figure out why. Which is not optimal time wise, but it maybe worked. I ran npm test and looked through the terminal output and stack traces in WebStorm, and used the AI assistant as a debugging partner when I got stuck or didn't understand exactly what was causing something to crash (like bad typing or stuff that should have been obvious). I tried not to just guess at the problem and change random stuff until the tests passed. I wanted to understand what was actually going wrong. Which I feel like I mostly succeeded at. In particular it was the methodNotAllowed handlers. I found a post on stack overflow from 10 years ago where someone was explaining that instead of using $.post you can literally just put the exact command the server requires, which kinda blew my mind byt worked like witch craft. 

The "nextId is not defined" and "orders is not defined" bugs. When I was working on orders.controller.js I accidentally overwrote the imports at the very top of the file. That caused the server to crash when I started hitting the POST and GET tests because it couldn't find the ID generator or the actual order data. Which feels more obvious now (see statement about obvious stuff above). I traced the problem back up through the file and realized the imports were gone. I put them back and established the path.resolve paths so everything was pointing where it was supposed to. Then we had the "URL / User ID mismatch" parameter bugs. In an earlier module I ran into a really frustrating problem where a route parameter was coming back as undefined and giving me a 500 HTML response instead of the error response I was expecting. The stack trace eventually pointed me toward a capitalization problem (see bad typing). The route was using :userID while I was trying to read userId from req.params. Once I made those match, it worked. That one actually helped me understand how Express was taking the parameters from the URL and passing them into the request because while I know camelCase is and should be used, in my head I got stuck on the aspect of ids/Ids being IDS and this was a recurring issue. Finally, maybe... There was likely more, I had the missing *return* validation leak. Early on I had some validation checks that were catching bad data but the code underneath them was still running. I eventually figured out that just calling next() doesn't magically stop the rest of the current function from executing. It tells Express to move on but JavaScript is still going to keep going unless I stop it. Changing those validation checks to return next() fixed that by stopping the function immediately when the validation failed. The validation checks where a life saver and honestly the thing I am most proud of about all of this. 

This is pertinent. I am not familiar with github, and I should be and I know that. I will be. But for now when I was copy pasting from the web IDE in the assessment to individual pages in Webstorm and then copy pasting them back after running through it and debugging it then running it in the web IDE to see if it passed, it did not set me up well for this whole github space. Which is fully on me. I am an adult, I know better. I just think its important that I am honest about me directly kind of skipping that instruction on the assessment page because for some reason I thought it was a "made up scenario" for the GrubDash project. 
