#!/usr/bin/env python3
"""Build the moratorium.ai redesign from the site's own content.

Reads the essay from the moratorium.ai repo (docs/intro.md) and the quotes from
src/pages/index.js, so the words stay the site's own; writes a static site to ../site.
Usage: python3 build.py [path-to-moratorium.ai-repo]
"""
import html, json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mor'
OUT = os.path.join(HERE, '..', 'site')

lines = open(os.path.join(REPO, 'docs', 'intro.md'), encoding='utf-8').read().split('\n')

def idx(prefix, start=0):
    for i in range(start, len(lines)):
        if lines[i].lstrip().startswith(prefix):
            return i
    raise SystemExit('marker not found: %r' % prefix)

# ids exactly as the live site renders them (github-slugger), so old links keep working
IDS = {
    'Summary': 'summary',
    'AI is unlike any new technology humanity has faced.': 'ai-is-unlike-any-new-technology-humanity-has-faced',
    "Once AI surpasses humans, if it doesn't care about us, we lose control. Permanently.": 'once-ai-surpasses-humans-if-it-doesnt-care-about-us-we-lose-control-permanently',
    'Why the default is global extinction': 'why-the-default-is-global-extinction',
    'Have we solved this? No; and we’re not even close.': 'have-we-solved-this-no-and-were-not-even-close',
    'Action cannot wait.': 'action-cannot-wait',
    'What can be done?': 'what-can-be-done',
    'The public, and history, are watching': 'the-public-and-history-are-watching',
    'Intelligence': 'intelligence',
    'Modern machine learning': 'modern-machine-learning',
    'Outer and inner AI alignment': 'outer-and-inner-ai-alignment',
    'Outer alignment': 'outer-alignment',
    'Convergent instrumental subgoals': 'convergent-instrumental-subgoals',
    'Inner alignment': 'inner-alignment',
    'Existential risk': 'existential-risk',
    'Counterarguments': 'counterarguments',
}
def slug(t):
    t = t.lower().replace('’', '').replace("'", '')
    t = re.sub(r'[^a-z0-9 -]', '', t)
    return re.sub(r'\s+', '-', t.strip())

NOTES = {}
NOTE_NUM = {'2': 1, '3': 2}   # the old site showed these as notes 1 and 2

def prep(seg_lines, level_map=None):
    out = []
    for raw in seg_lines:
        s = raw.rstrip()
        st = s.strip()
        if st in ('---', '***', '<br/>', '') and st != '':
            continue
        if st.startswith('{/*') or st.startswith('*/}') or st.startswith('<a className="button button--outline button--primary" href="#ai-moratorium"'):
            continue
        m = re.match(r'^(#{2,4})\s+(.*)$', st)
        if m:
            text = m.group(2).strip()
            lvl = len(m.group(1))
            lvl = (level_map or {}).get(lvl, lvl)
            hid = IDS.get(text, slug(text))
            out.append('<h%d id="%s">%s</h%d>' % (lvl, hid, html.escape(text, quote=False), lvl))
            out.append('')
            continue
        m = re.match(r'^<h4[^>]*>(.*)</h4>$', st)
        if m:
            out.append('<p class="dek">%s</p>' % m.group(1)); out.append(''); continue
        m = re.match(r'^\*\*\*(.+)\*\*\*$', st)
        if m:
            q = m.group(1).strip()
            out.append('<h3 id="%s">%s</h3>' % (slug(q), html.escape(q, quote=False))); out.append(''); continue
        m = re.match(r'^\[\^(\d+)\]:\s*(.*)$', st)
        if m:
            NOTES[m.group(1)] = m.group(2); continue
        # the chat-tool button becomes a sentence
        s = re.sub(r'see if it can answer: <a className="[^"]*" href="([^"]+)">Go here</a>',
                   r'see if it can answer: [ask it here](\1).', s)
        # double hyphens were meant as dashes
        s = re.sub(r'(?<=\S)--(?=\S)', '—', s)
        s = s.replace(' -- ', ' — ')
        # footnote references
        s = re.sub(r'\[\^(\d+)\]', lambda mm: '<sup><a href="#user-content-fn-%s" id="user-content-fnref-%s" aria-describedby="footnote-label">%d</a></sup>' % (mm.group(1), mm.group(1), NOTE_NUM.get(mm.group(1), int(mm.group(1)))), s)
        out.append(s)
    return '\n'.join(out)

def md(text):
    r = subprocess.run(['pandoc', '-f', 'markdown-auto_identifiers-smart+raw_html', '-t', 'html5', '--wrap=none'],
                       input=text.encode('utf-8'), capture_output=True, check=True)
    h = r.stdout.decode('utf-8')
    # external links open in a new tab, like the old site's
    h = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', h)
    # the old site linked its own PDF absolutely; keep it relative so previews work too
    h = h.replace('https://moratorium.ai/content/', 'content/').replace('href="content/', 'href="content/').replace('content/YouGov_Blue_lionheart_ai_research_toplines_AI_items_s2.pdf" target="_blank" rel="noopener"', 'content/YouGov_Blue_lionheart_ai_research_toplines_AI_items_s2.pdf"')
    return h

def seg(a, b):
    return lines[a:b]

i_sum = idx('## Summary'); i_unl = idx('### AI is unlike'); i_sur = idx('### Once AI surpasses'); i_worry = idx('Do you worry')
i_def = idx('### Why the default'); i_sol = idx('### Have we solved'); i_act = idx('### Action cannot wait'); i_what = idx('### What can be done?')
i_pub = idx('### The public, and history'); i_pub_end = idx('{/*', i_pub)
i_int = idx('## Intelligence'); i_ml = idx('## Modern machine learning'); i_oi = idx('## Outer and inner AI alignment')
i_out = idx('### Outer alignment'); i_conv = idx('#### Convergent instrumental subgoals'); i_inn = idx('### Inner alignment')
i_dont = idx("We don't design modern AI systems"); i_exi = idx('## Existential risk'); i_exi_end = idx('</HashAwareCollapsible>', i_exi)
i_mor = idx('## AI Moratorium'); i_mor_h4 = idx('<h4', i_mor); i_shouldnt = idx("We shouldn't give AI systems"); i_call = idx('**We call on policymakers', i_mor)
i_cnt = idx('## Counterarguments'); i_cnt_end = idx('</HashAwareCollapsible>', i_cnt)

S = {}
S['summary'] = md(prep(seg(i_sum, i_unl), {2: 3}))
S['unlike'] = md(prep(seg(i_unl, i_sur)))
S['surpass_a'] = md(prep(seg(i_sur, i_worry)))
S['surpass_b'] = md(prep(seg(i_worry, i_def)))
S['default'] = md(prep(seg(i_def, i_sol)))
S['solved'] = md(prep(seg(i_sol, i_act)))
S['action'] = md(prep(seg(i_act, i_what)))
S['whatcan'] = md(prep(seg(i_what, i_pub)))
S['public'] = md(prep(seg(i_pub, i_pub_end)))
S['intel'] = md(prep(seg(i_int, i_ml)))
S['ml'] = md(prep(seg(i_ml, i_oi)))
S['outerinner'] = md(prep(seg(i_oi, i_out)))
S['outer'] = md(prep(seg(i_out, i_conv)))
S['convergent'] = md(prep(seg(i_conv, i_inn)))
S['inner_a'] = md(prep(seg(i_inn, i_dont)))
S['inner_b'] = md(prep(seg(i_dont, i_exi)))
S['exist'] = md(prep(seg(i_exi, i_exi_end)))
S['mor_a'] = md(prep(seg(i_mor_h4 + 1, i_shouldnt)))
S['mor_b'] = md(prep(seg(i_shouldnt, i_call)))
i_why = idx('***Why would everyone', i_cnt)   # the newer questions go before this answer, so the ending caption follows it
S['counter_a'] = md(prep(seg(i_cnt, i_why)))
S['counter_b'] = md(prep(seg(i_why, i_cnt_end)))
call = re.sub(r'^\*\*|\*\*$', '', lines[i_call].strip())

# notes, numbered as the old site showed them
notes_html = []
for key in sorted(NOTES, key=lambda k: NOTE_NUM.get(k, 9)):
    body = md(prep([NOTES[key]])).strip()
    body = re.sub(r'^<p>|</p>$', '', body)
    notes_html.append('        <li id="user-content-fn-%s">%s <a href="#user-content-fnref-%s" aria-label="Back to the text">Back</a></li>' % (key, body, key))

# quotes, as on the old home page (on_mobile kept as the site chose it)
src = open(os.path.join(REPO, 'src', 'pages', 'index.js'), encoding='utf-8').read()
block = src[src.index('const Quotes = ['):src.index('];', src.index('const Quotes = ['))]
block = re.sub(r'/\*.*?\*/', '', block, flags=re.S)
quotes = []
for m in re.finditer(r'\{\s*name:\s*\'(.*?)\',\s*title:\s*\'(.*?)\',.*?text:\s*\'(.*?)\',\s*link:\s*\'(.*?)\',(.*?)\}', block, flags=re.S):
    name, title, text, link, rest = m.groups()
    quotes.append({'name': name, 'title': title, 'text': text, 'link': link, 'mobile': 'on_mobile: true' in rest})
FIX = json.load(open(os.path.join(HERE, 'quote-fixes.json'), encoding='utf-8')) if os.path.exists(os.path.join(HERE, 'quote-fixes.json')) else {}
C0 = json.load(open(os.path.join(HERE, 'content.json'), encoding='utf-8'))
on_first_screen = set(h[0] for h in C0['hero_quotes'])   # the wall below doesn't repeat them
qh = []
for q in quotes:
    f = FIX.get(q['name'], {})
    if f.get('drop') or q['name'] in on_first_screen: continue
    text, title, link = f.get('text', q['text']), f.get('title', q['title']), f.get('link', q['link'])
    cls = 'q'   # five left after the first screen's six: all fit on a phone
    qh.append('      <figure class="%s"><blockquote><p>“%s”</p></blockquote><figcaption><a href="%s" target="_blank" rel="noopener">%s</a>, %s</figcaption></figure>' % (
        cls, html.escape(text, quote=False), html.escape(link), html.escape(q['name'], quote=False), html.escape(title, quote=False)))

tpl = open(os.path.join(HERE, 'template.html'), encoding='utf-8').read()
engine = open(os.path.join(HERE, 'engine.js'), encoding='utf-8').read()
for k, v in S.items():
    tpl = tpl.replace('{{SEG:%s}}' % k, v)
C = json.load(open(os.path.join(HERE, 'content.json'), encoding='utf-8'))
def li(items): return '\n'.join('      <li>%s</li>' % x for x in items)
def prow(r):
    cls = ' class="open"' if r.get('open') else ''
    held = '<span class="held">%s</span>' % r['held'] if r.get('held') else ''
    line = (' ' + r['line']) if r.get('line') else ''
    return '      <li%s><span class="y">%s</span><div class="t"><b>%s</b>%s%s</div></li>' % (cls, r['year'], r['what'], line, held)
import html as _h
def faq(items): return '\n'.join('<h3 id="%s">%s</h3>\n<p>%s</p>' % (slug(q), _h.escape(q, quote=False), a) for q, a in items)
def groups(items): return '\n'.join('      <dt>%s</dt><dd>%s</dd>' % (g, x) for g, x in items)
for k, v in {'CANWORK_DEK': C['canwork_dek'], 'CANWORK_ITEMS': li(C['canwork']), 'CANWORK_GROUPS': groups(C['canwork_groups']), 'CANWORK_CLOSE': C['canwork_close'], 'CANWORK_SRC': C['canwork_src'],
             'PREC_AFTER': C['prec_after'], 'ASK_INTRO': C['ask_intro'], 'ASK_REGIONS': li(C['ask_regions']), 'ASK_SCRIPT': C['ask_script'], 'ASK_SRC': C['ask_src'], 'FAQ_MORE': faq(C['faq_more'])}.items():
    tpl = tpl.replace('{{%s}}' % k, v)
for k, v in {'TLDR_SHORT': li(C['short']), 'TLDR_HAPPENED': li(C['happened']), 'HAPPENED_PULL': C['happened_pull'], 'HAPPENED_SRC': C['happened_src'],
             'PREC_DEK': C['prec_dek'], 'PREC_ROWS': '\n'.join(prow(r) for r in C['prec']), 'PREC_SRC': C['prec_src']}.items():
    tpl = tpl.replace('{{%s}}' % k, v)
# the first screen's short excerpts: each must be the verified quote itself, cut only at [...] or a bracketed word
full = {q['name']: (FIX.get(q['name'], {}).get('text', q['text']), FIX.get(q['name'], {}).get('link', q['link'])) for q in quotes if not FIX.get(q['name'], {}).get('drop')}
hq = []
for name, text, role in C['hero_quotes']:
    whole, link = full[name]; at = 0
    for part in re.split(r'\[[^\]]*\]', text):
        part = part.strip(' ,')
        if not part: continue
        k = whole.find(part, at)
        if k < 0: raise SystemExit('hero quote for %s is not in the verified text: %r' % (name, part))
        at = k + len(part)
    hq.append('    <figure class="hq"><blockquote><p>“%s”</p></blockquote><figcaption><a href="%s" target="_blank" rel="noopener">%s</a>, %s</figcaption></figure>' % (
        html.escape(text, quote=False), html.escape(link), html.escape(name, quote=False), role))
tpl = tpl.replace('{{HERO_QUOTES}}', '\n'.join(hq)).replace('{{QUOTES}}', '\n'.join(qh)).replace('{{NOTES}}', '\n'.join(notes_html)).replace('{{CALL}}', html.escape(call, quote=False)).replace('{{ENGINE}}', engine)
left = re.findall(r'\{\{[A-Z]+[^}]*\}\}', tpl)
if left: raise SystemExit('unfilled: %r' % left)

if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(OUT)
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(tpl)

# static files the old site served, kept at the same paths
for sub in ('content', 'img'):
    s = os.path.join(REPO, 'static', sub)
    if os.path.isdir(s): shutil.copytree(s, os.path.join(OUT, sub))
for extra in ('og.png',):
    p = os.path.join(HERE, extra)
    if os.path.exists(p): shutil.copy(p, os.path.join(OUT, 'img', extra))

# small pages: same type and sky, no flock
head = tpl[:tpl.index('</style>') + len('</style>')]
def page(title, desc, body, depth):
    up = '../' * depth
    h = head.replace('<title>AI moratorium is necessary to avoid extinction</title>', '<title>%s</title>' % title)
    h = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % desc, h)
    h = h.replace('href="img/favicon.ico"', 'href="%simg/favicon.ico"' % up)
    return h + '\n<style>body{min-height:100vh;background:#ffffff}.page{padding:12vh 0}</style>\n</head>\n<body>\n' + body.replace('{{UP}}', up) + '\n</body>\n</html>\n'

news = '''<main class="page"><div class="col">
  <p class="dek" style="margin-bottom:2rem"><a href="{{UP}}">AI moratorium is necessary to avoid extinction</a></p>
  <h1 style="font-size:clamp(2.6rem,1.6rem + 3vw,4rem)">Newsletter</h1>
  <p style="margin-top:1.5rem">Get occasional email updates on the risk of human extinction from AI: what’s changing, what leading scientists are saying, what governments are (and aren’t) doing, and concrete things you can do to help.</p>
  <p>We send emails only when there’s something worth your attention, and you can unsubscribe at any time. We won’t share your address with anyone.</p>
  <form class="sub" id="newsletter_form" novalidate>
    <label for="email_newsletter">Email address</label>
    <input type="email" id="email_newsletter" name="email" required autocomplete="email">
    <input type="hidden" name="form" value="moratorium.ai newsletter page">
    <button class="btn" type="submit">Subscribe</button>
    <p class="status" aria-live="polite" style="flex-basis:100%"></p>
  </form>
  <p style="margin-top:3rem">In the meantime: <a href="{{UP}}#why">why an AI moratorium is necessary</a>, or <a href="https://whycare.aisgf.us">chat with our tool about AI risk</a>.</p>
</div></main>
<script>
(function(){var f=document.getElementById('newsletter_form'),LIVE=/(^|\\.)moratorium\\.ai$/.test(location.hostname);
f.addEventListener('submit',function(e){e.preventDefault();var s=f.querySelector('.status'),b=f.querySelector('button');if(!f.checkValidity()){f.reportValidity();return;}
if(!LIVE){s.textContent='This is a preview copy of the site, so nothing was sent. On moratorium.ai this subscribes you.';return;}
b.disabled=true;s.textContent='Subscribing…';fetch('https://forms.moratorium.ai/?subscribe',{method:'POST',body:new FormData(f)}).then(function(r){return r.json();}).then(function(d){if(d&&d.success){var p=document.createElement('p');p.className='done';p.textContent=d.message||'Subscribed.';f.replaceWith(p);}else{s.textContent=(d&&d.message)||'That didn’t go through. Please try again.';b.disabled=false;}}).catch(function(){s.textContent='That didn’t go through. Please try again.';b.disabled=false;});});})();
</script>'''
os.makedirs(os.path.join(OUT, 'newsletter'))
open(os.path.join(OUT, 'newsletter', 'index.html'), 'w', encoding='utf-8').write(page('Newsletter · AI moratorium', 'Subscribe for updates on the risk of extinction from AI and what you can do about it.', news, 1))

# /docs/intro/ was the same essay; send it home, keeping any #anchor
redir = '''<main class="page"><div class="col"><p>The explanation now lives on the <a id="go" href="{{UP}}#why">home page</a>.</p></div></main>
<script>(function(){var h=location.hash&&location.hash.length>1?location.hash:'#why';location.replace('{{UP}}'+h);})();</script>'''
os.makedirs(os.path.join(OUT, 'docs', 'intro'))
open(os.path.join(OUT, 'docs', 'intro', 'index.html'), 'w', encoding='utf-8').write(
    page('Why we need a global AI moratorium', 'The explanation now lives on the home page.', redir, 2).replace('<head>', '<head>\n<meta http-equiv="refresh" content="0; url=../../#why">', 1))

nf = '''<main class="page"><div class="col"><h1 style="font-size:clamp(2.6rem,1.6rem + 3vw,4rem)">Nothing here</h1><p style="margin-top:1.5rem">This page doesn’t exist. <a href="/">The home page</a> has the explanation and how to help.</p></div></main>'''
open(os.path.join(OUT, '404.html'), 'w', encoding='utf-8').write(page('Not found · AI moratorium', 'Page not found.', nf, 0))

print('built', OUT, 'segments', len(S), 'quotes', len(quotes), 'notes', len(notes_html), 'bytes', len(tpl))
