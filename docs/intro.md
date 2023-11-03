---
sidebar_position: 1
---


import Collapsible from '../src/components/Collapsible/index.js';
import WrapFootnotes from '../src/components/Collapsible/WrapFootnotes.js';
import HashAwareCollapsible from '../src/components/Collapsible/HashAwareCollapsible.js';
import FormInputs from '../src/components/Forms/inputs.js';

# Why we need a global AI moratorium

## Summary

Experts are concerned about the **existential threat from advanced artificial intelligence (AI) systems**.

Within the next **10-15 years**, many researchers expect to achieve **superhuman artificial general intelligence (AGI)**. Leading AI labs (OpenAI, Google DeepMind, and Anthropic) state[\[1\]](https://openai.com/charter)[\[2\]](https://www.deepmind.com/about) the creation of a superhuman AGI as their goal.

While researchers find ways to advance on a path towards superhuman AI, the field does not currently recognize any promising leads as to how to make a future AGI pursue goals we’d want it to pursue.

"AI alignment" is the problem of aligning future AI goals and behavior with human values. **Some employees of OpenAI, DeepMind, and Anthropic think the probability of extinction is around 80-90%**[^1]. They use the word “extinction” literally and don’t refer to, say, unemployment. The reason for this is that we’re not on track to solve the technical problem of AI alignment in time. **If it remains unsolved when we reach an AGI, humanity will likely go extinct.**

[^1]: From personal conversations with people working at OpenAI, DeepMind, and Anthropic.

Urgent action is needed from governments around the world to prevent an existential catastrophe.

Today, cutting-edge AI systems are artificial neural networks: millions to trillions of numbers we automatically adjust until they start achieving a high score on some metric. We don't know what these numbers represent. **We do not how the resulting AI systems work, or what their goals are**.

Artificial neural networks can implement algorithms that are smart, have an internal representation of some goals and try to achieve these goals (what we call “agentic”). The field of modern machine learning focuses on searching for neural networks that implement algorithms that perform well on some objective, and this search tends to go towards smarter and more agentic systems, but we have very little insight into what the algorithms that we find actually do.

We know how to find systems with *some* goals and we get better at finding “agentic” systems, but we have no idea how to precisely specify goals that would be safe for a superhuman system to pursue, and furthermore, we don’t even know how to find systems with *any* goals that we’d want AIs to have. The default path to a superhuman AGI is a path to a system with alien goals that have no place for human values. **We don’t know how to make sufficiently advanced AI systems care about humans at all**, or have any of the goals we'd want it to have. The technical problem of creating AI that’s aligned with human values consists of multiple hard-to-solve parts, and researchers don't expect to be able to solve it in time, unless governments intervene.

If a capable enough mind doesn't care about humans, then we’re just atoms it can use to achieve its random alien goals (and also entities that produce a threat of launching another AI that it’d have to deal with), and the natural consequence is that everyone (literally) dies as a side effect of AI utilising all available resources on cosmic scales.

**Without international coordination** to regulate potentially dangerous AI training runs and prevent AGI from being created before the technical problem is solved, **many researchers expect humanity to go extinct**. We welcome the progress we observed over the recent months, but it's still too slow, and we hope to increase engagement with the problem and technical understanding among policymakers.


<a className="button button--outline button--primary" href="#intelligence">Read about the technical problem</a>

<!-- 
<a className="button button--outline button--primary" href="#ai-moratorium">Skip to what the governments can do -></a> -->

***

<div className="technical-section">
<div className="container margin-bottom--lg margin-top--lg md-intro">
<div className="index-md">

<p style={{"font-size": "20px",color:"white","font-family":"MercurySSm-Book-Pro_Web,serif"}}>Read about the technical problem of AI alignment: how modern AI works and why exactly experts expect a catastrophe.</p>

<HashAwareCollapsible summaryCollapsed=<span style={{"font-size": "20px","color":"white"}}>Click to <b>learn about AI and AI Alignment</b> <i>(Est. reading time: 12 min.)</i></span> summaryExpanded=<span style={{"font-size": "20px"}}>Hide the explanation of AI and AI Alignment and read about what the governments can do</span>><br/>

## Intelligence

<h4 style={{"text-align": "center"}}>What does it mean to be smarter than us?</h4>

If you play chess against Stockfish (a chess engine), you can’t predict its every move (or you’d be as good at the game as it is), but you can predict the result: you’ll lose.

We use words like “intelligence” to describe something that humans are better at than monkeys, who have more of it than mice, who have more of it than spiders. This is the property that resulted in humanity having shaped the way Earth looks to a much larger extent than monkeys have. If monkeys really wanted something, but humans really wanted something different, because of that property, humans would usually win.

The relevant part of that property is ability to achieve goals (which can include wisdom about human nature, ability to be charismatic, practical knowledge about how to make things in the physical world, as well as general knowledge and ability to infer new knowledge from observations and experimentation).

No known law of physics disallows for systems to be higher than humans along this dimension: to be even smarter, to be better at understanding the world and achieving goals. We’re just the first to be smart enough to build a civilization and experience thinking about this question.

Stockfish is a narrow system: it can’t really understand the universe and drastically shape the future. But if a general artificial intelligence is smarter than you, its goals are incompatible with yours, and it’s better than you at achieving its goals in the real world, the situation might be catastrophic.

It’s reasonable to expect that without substantial effort, a smarter-than-humans general AI will be developed while we still have no idea how to sufficiently align the goals it pursues with human values, so it will pose an existential threat: a threat of literally wiping out humanity.

## Modern machine learning

<h4 style={{"text-align": "center"}}>How does it all work?</h4>

When software engineers write programs, they design an algorithm that achieves some objective, and then they express that algorithm using a programming language. But modern machine learning (ML) systems, such as ChatGPT, GPT-4, or AlphaFold, aren't algorithms designed by humans: they're neural networks. With neural networks, we don't design the specific steps a computer should take to achieve an objective. We just specify some measure of performance (that we hope captures the objective) and randomly initialise a lot of numbers (billions or even trillions of them, called parameters) that we then change in a way that makes the neural network start achieving a high score on our objective.

For any possible algorithm, there's a neural network that approximates it.[\[3\]](https://en.wikipedia.org/wiki/Universal_approximation_theorem) So we find neural networks that implement some unknown algorithms and hopefully achieve our objectives.

This works via gradient descent: we nudge the parameters into directions that make the neural network perform better. With a bit of math (automatically taking the derivatives of the objective with respect to every parameter), we know whether to increase or decrease the numbers so the performance measurement goes up, and how relatively important various changes are. We then slightly change all the parameters so the whole neural network performs better, and repeat the process. As we automatically do this over and over again, the numbers become less random and gradually transform into implementing some unknown algorithm that, in the process of working, achieves the objective.

For most real-world problems, we have no idea how the neural networks actually perform the job; we have no insight into what algorithms they implement. Even with full read access to all the numbers that make up the neural networks, researchers have yet to discover what the algorithms are that are implemented by these numbers. We can find out how they perform the simplest tasks, like adding numbers or storing a connection between the Eiffel Tower and Paris. But all the tasks we can identify algorithms for are tasks we could solve with conventional methods. Neural networks are able to do what we have no idea how to design algorithms for, and we don’t understand how they do these things. GPT-4 is powerful, but we don’t know why or how; we’ve just grown it to show these results. We don’t understand what’s going on inside of it when it writes in English. It is an opaque black box even to its creators.

GPT-4 can be impressive: it knows a lot and can even perform tasks that require not just remembering facts but thinking critically. It’s clearly not generally superhuman, but it’s safe to say that mostly, it’s smarter than 7-year-old humans.

If you imagine a human brain as a function of inputs and outputs (all the electrical impulses, chemicals, etc.[^2]), there exists some possible large artificial neural network that can copy its behaviour. And if there is an algorithm for understanding the world and planning on how to achieve some goals in it— something like what we fuzzily perform— there is a neural network that implements this algorithm.

[^2]: The current scientific consensus is that the processes in the human brain are computable: a program can, theoretically, simulate the physics that run a brain.

So, we should expect AI to eventually become generally smarter than humans. 

## Outer and inner AI alignment

<h4 style={{"text-align": "center"}}>Why is it a problem?</h4>

When you search for neural networks that are increasingly better at achieving an objective like playing a game well, first, you stumble across neural networks that are mostly collections of heuristics: e.g., seeing a monster and pressing on a certain key is simple and gives a boost in performance, so the neural network implements an algorithm that does that. But then you start stumbling across agents: they might search, plan, or even explore the game world to better understand it so they can better achieve their goals later. Algorithms that implement agentic optimisation, with goals of their own, perform better in a wide range of performance measurements.

A superhuman AI will be pursuing some goals. What goals would be safe for it to pursue is an open research question (commonly referred to as “outer alignment”). How to find an AI that pursues the goals we want it to have instead of some completely different goals is also an open research question (“inner alignment”).

When neural networks play computer games, it’s not catastrophic that they develop some random goals, achieving which correlates with the stated objective. But the smarter the neural network can be, the more impactful the difference between what you actually want and the objective that you’ve stated, as well as the difference between the stated objective and the goals that the neural network tries to achieve, can become.

### Outer alignment

<h4>What goals do we give the AI?</h4>

We have no idea how to specify, in math, goals that it would be safe to make a superhuman AI pursue.

Algorithms that get a higher score are selected by gradient descent, regardless of what exactly they do to achieve that high score.

The difference between what you would actually want (if you had access to all the relevant information and were smarter or more like the person you wish you were) and the objective, expressed in math, that you’re optimizing neural networks for, is problematic, if this objective is pursued with superhuman ability.

It might help to speculate about some examples. If your wish doesn’t contain everything that you care about, and an AI genie robot wants to literally achieve what you’ve expressed in your wish, the results can be disastrous. Imagine that you tell it you want to get a cup of coffee as quickly as possible, and fulfilling this wish is the only goal it needs to worry about. What can go wrong?[^3]

[^3]: For example, imagine that you haven't specified the value you put into a vase in the living room not getting destroyed, and no one getting robbed or killed. So if there’s a vase in the way of the robot, it won’t care about accidentally destroying it. What if there’s no coffee left in the kitchen? The robot might drive to the nearest café or grocery to get coffee, not worrying about the lives of pedestrians. It won’t care about paying for the coffee if it wasn’t specified in its only objective. If anyone tries to turn it off, it will do its best to prevent that: it can’t fetch the coffee and achieve its objective if it’s dead. And it will try to make sure you’ve definitely got the coffee. It knows there might be some small probability of its memory malfunctioning or camera lying to it; and it’ll try to eradicate even the tiniest chance that it hasn’t achieved the goal.

It's like in Goethe's [Sorcerer's Apprentice](https://en.wikipedia.org/wiki/The_Sorcerer%27s_Apprentice) (or its [Disney adaptation](https://youtu.be/3hKgEylk8ks) with Mickey Mouse): if you task a broom with filling a bucket with water, it might create a flood. There are a million things that you value, and the robot will happily trade off anything not mentioned in its objective. 	

Imagine wishing for the robot to make you smile or feel happy or click on the thumbs-up button. The robot wants to achieve this with the highest certainty and get the maximum reward, by any means possible. What happens?

Before the AI is at a superhuman level, this misalignment of the specified objective and human values isn’t as much of an issue, since robots are not yet good enough at pursuing their objectives. If your dog automatically gets treats when it makes you smile, it’s not a problem, because dogs aren’t smart enough to figure out they can inject drugs into you and make you smile all the time. Here, the optimization pressure isn’t too high, and your dog might care about you.	

But as more capable neural network architectures can approximate algorithms that are smarter and better at agency, the problem can become worse. We don’t know what objective we could specify, in math, that would capture everything we value and wouldn’t lead to catastrophic consequences under enormous optimization pressure. It’s really hard to express preferences about the future you can safely point a superintelligent AI to (see [The Hidden Complexity of Wishes](https://www.lesswrong.com/posts/4ARaTpNX62uaL86j6/the-hidden-complexity-of-wishes) for more on this). We have no idea how to design a mathematical formula that encapsulates caring about you and can be used as an objective for a superhuman AI.

***

#### Convergent instrumental subgoals

As suggested by researchers, if you try to achieve almost any final goals (deep preferences about the future of the world), it might be helpful to have a number of instrumental subgoals (that is, goals that are pursued not because of some intrinsic value but for the purpose of achieving the final goals). These instrumental goals might be:

- **Self-preservation**: The agent will value its continuing existence as a means for continuing to take actions that promote its values. A future less influenced by the agent shaping it according to its preferences would usually mean that this future is less preferable. E.g., you can't fetch the coffee if you're turned off.
- **Resource acquisition**: In addition to guaranteeing the agent's continued existence, basic resources such as time, space, matter and free energy could be processed to serve almost any goal, in the form of extended hardware, backups and protection.
- **Cognitive enhancement**: Improvements in cognitive capacity, intelligence, and rationality will help the agent make better decisions, furthering its goals more in the long run.
- **Goal-content integrity**: The agent will value retaining the same preferences over time. If modifying its future values (e.g., through swapping memories or altering its cognitive architecture and personalities) and transforming into an agent that no longer optimizes for the same things means the universe is worse according to its current preferences, it will try to prevent these modifications. For example, if the agent wants to maximize the number of smiley faces in the universe it doesn't want humans to change its goals into maximizing the number of paperclips in the universe: it prefers the futures with more smiley faces, and if its future version maximizes something else, in this scenario, there would be less smiley faces overall.
- **Technological perfection**: Increases in the agent's hardware power and algorithm efficiency will deliver increases in its cognitive capacities. Also, better engineering will enable the creation of a wider set of physical structures using fewer resources (e.g., nanotechnology).

During training, AI systems that are more capable, more goal-oriented, and better at figuring out instrumental goals to achieve in support of long-term plans, are likely to score better on a variety of metrics and outcompete other AI systems. Because of this, we can expect general AI systems optimised with gradient descent for almost any sort of metric to possess the above instrumental subgoals.

***

So, we don’t know what goals are safe to specify for a superhuman AI to pursue, and if it pursues goals different from what we would want, it might try to acquire resources and prevent us from turning it off. If it is capable enough to outsmart us, it might succeed. This part of the alignment problem was discovered long before modern machine learning became popular. Not much progress has been made since, it is still an open problem, although some ideas for where a solution might lie were proposed (e.g., [Coherent Extrapolated Volition](https://arbital.com/p/cev/)).

The state of the field resembles scientists and engineers who want to launch a rocket to the Moon in the 1800s. If you imagine the space of all possible superintelligent AIs, you want to get to some small subspace that contains agents whose preferences are aligned enough with those of humans: the “Moon”. But the current situation can be described this way: people have a bunch of “explosives”; we haven’t yet figured out the “equations for gravity” and don’t understand the space at all; we have equations for “acceleration” and maybe some useful intuitions, but almost can’t talk in math about what it means for agents to be aligned and so can’t clearly specify a target to engineer our way into (we know that the “Moon” must be somewhere in the sky, but for now, it’s invisible); we also have math for how specific suggested ways of launching the rocket make it explode or certainly end up somewhere that’s not the Moon; but without much more research, it is impossible to engineer a rocket that doesn’t explode and doesn’t end up somewhere that’s definitely not the Moon. And in some ways, this is harder than physics and rocket science: here, we’ve only got one attempt: if we fail on the first try and our rocket goes rogue, an existential catastrophe occurs, and we don’t get another chance.

### Inner alignment

<h4>How do we actually give it the goals?</h4>

Even if we solved the problem of specifying an objective that somehow points at everything we value, and figured out what kind of agent we’d want the AI to be, it wouldn't be enough to succeed: we have no idea how to find an AI that has the objectives we want it to have.

With modern deep learning, we don’t get to design the agent, we don't write an algorithm for general decision-making that'd evaluate the consequences according to a utility function that captures our values. Instead, we just find some random algorithm that tries to achieve some goals and as a result scores well on our metric. We have no insight into what the goals of the resultant neural network are.

That makes the alignment problem even harder: we control the measurement of the agent’s performance during training, but agents with a wide range of goals might achieve a high performance. We don't write the algorithm itself, and we have no control over what goals it has.

Near the human level and beyond, the smarter the agents are, the wider is the range of goals they can have and still score well on our metric: smarter and more agentic algorithms are generally better at achieving a higher score on many tasks; and if a smart enough agent understands what’s going on, it will try to achieve the reward target regardless of its deep preferences about the future: if it doesn't, then the neural network’s parameters will change to be implementing an algorithm that does and achieves a higher score. That change might alter the agent's goals, which it would want to prevent.

In other words, smart agents with a variety of goals would play along while being measured; and will do what they want when they’re able to.

We don't design modern AI systems; we grow them, with no control or understanding over what it is that we are growing. Researchers argue that algorithms created this way are likely to pursue convergent instrumental subgoals to achieve their final goals, which might not be correlated with our goals at all.[\[4\]](https://arxiv.org/abs/2209.00626)

## Existential risk

<h4 style={{"text-align": "center"}}>What's the worst that can happen?</h4>

Once gradient descent starts finding smart and agentic enough systems, we’re in trouble if we haven’t yet figured out how to make the gradient descent search for aligned systems.

If someone throws enough compute at training AI to find something agentic and smarter than humans, but the technical alignment problem isn't yet solved, it seems reasonable to expect that shortly afterwards, humans will lose control and all biological life on Earth will cease to exist. According to some researchers, if this scenario occurs, a significant portion of the matter in the visible universe is likely to be used for something random that happens to max out the AI’s utility function.

If a system is better than you at science, at persuading people, at finding software and hardware vulnerabilities, at predicting the consequences of actions, and at seeing potential threats, and if it wants to shape the future of the universe and it doesn’t care about you, then you’re made of atoms it can and successfully use for something else. (And if you can launch another AGI with different goals, or try to turn off all the electricity, this is a threat it’ll see and prevent.)

At the moment, tens of thousands of ML researchers are racing ahead to advance AI capabilities. Only a couple hundred people in the world are working on the technical AI alignment problem. This wouldn’t be enough to solve this huge scientific problem in any realistic timeframe, let alone before a superhuman AI is launched. Until we know how to align a general AI with the preferences of humanity and make it aid us in achieving our goals, launching powerful AI systems poses an existential threat, as by default, capable AI systems possess their own goals, not aligned with ours.

And if a system is much better than us at achieving goals and its goals are different from ours, we lose.

How do we prevent this?

</HashAwareCollapsible>

</div>
</div>
</div>

***

## AI Moratorium

<h4 style={{"text-align": "center"}}>How do we prevent a catastrophe?</h4>

The leading AI labs are in a race to create a powerful general AI, and the closer they get, the more pressure there is to continue developing even more generally capable systems.

Imagine a world where piles of uranium produce gold, and the larger a pile of uranium is, the more gold it produces. But past some critical mass, a nuclear explosion ignites the atmosphere, and soon everybody dies. This is similar to our situation, and the leading AI labs understand this and say they would welcome regulation.

Researchers have developed techniques that allow the top AI labs to predict some performance metrics of a system before it is launched, but they are still unable to predict its general capabilities.

Every time a new, smarter AI system starts interacting with the world, there's a chance that it will start to successfully pursue its own goals. Until we figure out how to make general AI systems safe, every training run and every new composition of existing AI systems into a smarter AI system poses a catastrophic risk.

A suggested way to prevent dangerous AI launches is to **impose strict restrictions on training** potentially generally capable AI systems. The restrictions need to be implemented both on national levels and, eventually, on the international level, with the goal of **preventing bad and reckless actors from having access to compute** that might allow them to launch AI training that could be dangerous to humanity as a whole.

The supply chain of AI is well understood and contains multiple points with near-monopolies, so many effective interventions can be relatively simple and cheap. Almost all AI applications don’t require the amount of compute that training frontier general AI models requires, so **we can regulate large AI training runs without significantly impacting other markets** and economically valuable use of narrow AI systems.

First, for the other measures to be effective, we need to **introduce monitoring and ensure the non-proliferation** of relevant technologies to non-allied countries. We also need to introduce a threshold: the amount of compute below which the training with current technologies is considered to be unlikely to produce dangerous capabilities. This threshold needs to be revisable, since as machine learning methods improve, the same level of capabilities can be achieved with lower compute.

Then, we need to **impose restrictions on AI training runs that require more than the calculated threshold**. As a lead investor of Anthropic [puts it](https://twitter.com/liron/status/1656929936639430657), “I’ve not met anyone in AI labs who says the risk [from a large-scale AI experiment] is less than 1% of blowing up the planet”. **Potentially dangerous training runs should be prohibited by default**, although we should be able to make exceptions, under strict monitoring, for demonstrably safe use of compute for training or using narrow models that clearly won’t develop the ability to pursue dangerous goals. At the moment, narrow AI training runs usually wouldn’t take even closely the amount of compute utilised for current frontier general models, but in the future, purposes such as novel drug discovery could require similar amounts of compute.

**Regulation of AI to prevent catastrophic risks is widely supported by the general public**. In the US, 86% believe AI could accidentally cause a catastrophic event; 82% say we should go slow with AI compared to just 8% who would rather speed it up; 70% agree with the statement that “Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war” ([YouGov for AIPI](https://moratorium.ai/content/YouGov_Blue_lionheart_ai_research_toplines_AI_items_s2.pdf), July 2023). 77% express their preference for policies with the goal of preventing dangerous and catastrophic ourcomes from AI (57% for preventing AI from causing human extinction) ([YouGov for AIPI](https://twitter.com/DanielColson6/status/1716564864183734349), October 2023). Across 17 major countries, 71% believe AI regulation is necessary ([KPMG](https://assets.kpmg.com/content/dam/kpmg/au/pdf/2023/trust-in-ai-global-insights-2023.pdf), February 2023). In the UK, 74% agree preventing AI from quickly reaching superhuman capabilities should be an important goal of AI policy (13% don't agree); 60% would support the introduction of an international treaty to ban any smarter-than-human AI (16% would oppose). 78% don't trust the CEOs of technology companies to act in the public interest when discussing regulation for AI ([YouGov for ai_ctrl](https://twitter.com/tegmark/status/1717297520437535204), October 2023).

We shouldn't give AI systems a chance of becoming more intelligent than humans until we can figure out how to do that safely.

**Until the technical problem of alignment is solved, to safeguard the future of humanity, we need strict regulation of general AI and international coordination.**

Some regulations that help with existential risk from future uncontrollable AI can also **address shorter-term global security risks**: experts [believe](https://www.judiciary.senate.gov/committee-activity/hearings/oversight-of-ai-principles-for-regulation) that systems capable of developing biological weapons could be about 2-3 years away. Introducing regulatory bodies, pre-training licensing, and strong security and corporate governance requirements can prevent the irreversible proliferation of frontier AI technologies and establish a framework that could be later adapted for the prevention of existential risk.

**We call on policymakers around the world to establish and enforce national restrictions and then a global AI moratorium that would prevent anyone in the world from risking human extinction.**

<p className="centered"><a className="button button--outline button--primary button--lg" href="#how-to-help" id="help_moratorium_button">Help AI Moratorium</a></p>

***


<HashAwareCollapsible summaryCollapsed=<span>Show <b>How to help</b></span> summaryExpanded=<span>Hide <b>How to help</b></span>><br/>
<div id="how-to-help"/>

<div style={{"min-width": "360px"}} className="contact-form">
<h3 style={{"text-align": "center"}}>Share the information</h3>

Talk to your friends, colleagues, followers, and elected officials about this problem and point them to *moratorium.ai* for the details.

<p style={{"text-align": "center"}}><a href="https://twitter.com/intent/tweet?text=Experts%20say%20future%20AI%20systems%20might%20end%20humanity,%20and%20we%20need%20AI%20Moratorium&url=https%3A%2F%2Fmoratorium.ai%2F"><icon icon="fa-brands fa-x-twitter" size="lg" /> Tweet</a>&ensp;&ensp;&ensp;<a href="https://www.facebook.com/sharer.php?t=Experts%20say%20future%20AI%20systems%20might%20end%20humanity,%20and%20we%20need%20AI%20Moratorium&url&u=https%3A%2F%2Fmoratorium.ai%2F"><icon icon="fa-brands fa-facebook" size="lg" /> Share</a>&ensp;&ensp;&ensp;<a href="#copy" id="share_button_copy"><icon icon="fa-regular fa-copy" size="lg" /> <span id="copy_text">Copy</span></a></p>

</div>
<div className="contact-forms-container">

<!--<div className="vertical-hr"></div>-->

<div className="contact-form">
<h3 style={{"text-align": "center"}}>Join us</h3>

Join the effort to establish **an international AI moratorium**.

<form id="join_form">
<input type="hidden" name="form" value="join_form"/>
<FormInputs inputs={[
	{
		name: "email",
		description: "Email",
		mandatory: true,
		bold: true,
	},
	{
		name: "name",
		description: "Name",
		mandatory: false,
		bold: true,
	},
	{
		name: "help_with",
		description: "How can you help?",
		mandatory: false,
	},
	{
		name: "background",
		description: "What's your background?",
		mandatory: false,
	},
	{
		name: "comments",
		description: "Any comments",
		type: "textarea",
		mandatory: false,
		placeholder: "Feel free to share any thoughts, ideas, or suggestions here",
	},
]} />
<br/>

<p className="centered"><input className="button button--outline button--primary button--lg" type="submit" value="Submit" /></p>
</form>
</div>
</div>

</HashAwareCollapsible>

<HashAwareCollapsible summaryCollapsed=<span>Show <b>Counterarguments</b></span> summaryExpanded=<span>Hide <b>Counterarguments</b></span>><br/>

## Counterarguments

***Is there evidence that these dangers are real?***

It is important to note that existential risk from AI is speculative in nature: this threat is posed by technology that does not yet exist. The behaviour of current AI systems shouldn't be taken as much evidence one way or another, as the existential risk depends on dynamics in systems smarter than humans, which are expected to be different from the dynamics in the current systems.

That said, according to [forecasters](https://www.metaculus.com/questions/3479/date-weakly-general-ai-is-publicly-known/) and public statements[\[4\]](https://www.youtube.com/watch?v=Nlkk3glap_U) from the top AI labs, unless something interferes with the speed of AI progress, we might have between 2 and 15 years until the technology in question: artificial general intelligence.

And researchers do indeed observe behaviour that supports these claims, even in systems where it should be far easier to solve than in superintelligent AIs. There are examples of inner misalignment: AI systems pursuing goals different from what the creators of these systems hoped they would and gave rewards for. There are examples of AI systems attempting to deceive or manipulate humans when it helps (or they think it helps) them survive, get higher reward, or achieve other goals.[\[5\]](https://arxiv.org/pdf/2210.01790.pdf)[\[6\]](https://openai.com/research/learning-from-human-preferences#challenges)[\[7\]](https://www.lesswrong.com/posts/jtoPawEhLNXNxvgTT/bing-chat-is-blatantly-aggressively-misaligned)[\[8\]](https://arxiv.org/pdf/2212.09251.pdf)

***Can regulation on a national level decrease our competitiveness?***

It is important to get the benefits of these technologies while avoiding the dangers. Indeed, it might take a lot of work to balance the two. Regulations should only prevent the training of generally capable models that could pose existential or security risks and the proliferation of technologies that could make it easier to build dangerous models. It is important to aim to minimize the impact on beneficial and economically valuable innovation. Responsible investment in ethical and non-dangerous use of AI, such as for drug discovery or perhaps education, should be welcomed.

***Why would everyone stay within the rules?***

Citing testimony in the UK House of Commons, "If we develop a shared understanding of the risks here, the game theory isn't that complicated. Imagine there was a button on Mars labelled "geopolitical dominance", but actually, if you pressed it, it killed everyone. If everyone understands that, there is no space race for it. If we as an international community can get on the same page as many of the leading academics here, I think we can craft regulation that targets the dangerous designs of AI while leaving extraordinary economic value on the table".[\[9\]](https://committees.parliament.uk/oralevidence/12575/pdf/)

It is important to get everybody on board: we need to work with every nation that could be capable of building an AGI and causing humanity to go extinct. We need to develop a shared understanding of this threat to global security. We should also implement compute governance measures, making advanced AI chips trackable and preventing nations that don't regulate frontier AI from acquiring the capability to endanger humanity. 

</HashAwareCollapsible>

<WrapFootnotes />

<HashAwareCollapsible customToggleId="hide_contact_form"><br/>
<div className="contact-forms-container" id="contact">

<div className="contact-form">
<h3 style={{"text-align": "center"}}>Contact us</h3>

To talk to us, learn more, or get connected to the experts, reach out via this form.

<form id="contact_form">
<input type="hidden" name="form" value="contact_form"/>
<FormInputs inputs={[
	{
		name: "email",
		description: "Email",
		mandatory: true,
		bold: true,
	},
	{
		name: "name",
		description: "Name",
		mandatory: false,
		bold: true,
	},
	{
		name: "message",
		description: "Message",
		type: "textarea",
		mandatory: false,
		placeholder: "Any context you'd like to give us; any requests, questions, information, comments, or thoughts",
	},
]} />	

<p className="centered"><input className="button button--outline button--primary button--lg" type="submit" value="Submit" /> <button className="button button--outline button--danger button--lg" id="hide_contact_form" style={{display: "none"}}>Cancel</button></p>
</form>
</div>

</div>

</HashAwareCollapsible>