# primflo.github.io
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Quasar | GitHub Pages Site</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(145deg, #f9fafc 0%, #eef2f5 100%);
            font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            color: #1a2a3f;
            line-height: 1.5;
            scroll-behavior: smooth;
        }

        /* custom scroll */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #e0e7ed;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
            background: #3b82f6;
            border-radius: 10px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }

        /* header / nav */
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            padding: 20px 0;
            border-bottom: 1px solid rgba(59,130,246,0.15);
        }
        .logo {
            font-size: 1.8rem;
            font-weight: 700;
            background: linear-gradient(135deg, #1e293b, #3b82f6);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            letter-spacing: -0.5px;
        }
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        .nav-links a {
            text-decoration: none;
            font-weight: 500;
            color: #2c3e50;
            transition: color 0.2s ease;
        }
        .nav-links a:hover {
            color: #3b82f6;
        }
        .github-badge {
            background: #1f2a3e;
            color: white !important;
            padding: 8px 18px;
            border-radius: 40px;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.2s, background 0.2s;
        }
        .github-badge:hover {
            background: #0f172a;
            transform: translateY(-2px);
        }

        /* hero */
        .hero {
            padding: 80px 0 60px;
            text-align: center;
        }
        .hero h1 {
            font-size: 3.5rem;
            font-weight: 800;
            background: linear-gradient(to right, #0f2b3d, #2563eb);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            margin-bottom: 20px;
            letter-spacing: -1px;
        }
        .hero p {
            font-size: 1.3rem;
            color: #334155;
            max-width: 700px;
            margin: 0 auto 30px;
        }
        .cta-btn {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 32px;
            border-radius: 40px;
            font-weight: 600;
            text-decoration: none;
            box-shadow: 0 8px 20px rgba(37,99,235,0.25);
            transition: all 0.2s;
        }
        .cta-btn:hover {
            background: #1d4ed8;
            transform: scale(1.02);
            box-shadow: 0 12px 24px rgba(37,99,235,0.35);
        }

        /* cards grid */
        .section-title {
            font-size: 2rem;
            font-weight: 700;
            margin: 60px 0 30px 0;
            text-align: center;
            position: relative;
        }
        .section-title:after {
            content: '';
            display: block;
            width: 70px;
            height: 4px;
            background: #3b82f6;
            margin: 12px auto 0;
            border-radius: 4px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 32px;
            margin: 40px 0 20px;
        }
        .card {
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(2px);
            border-radius: 28px;
            padding: 28px 24px;
            box-shadow: 0 12px 28px rgba(0,0,0,0.05);
            transition: all 0.25s ease;
            border: 1px solid rgba(255,255,255,0.6);
        }
        .card:hover {
            transform: translateY(-6px);
            box-shadow: 0 25px 35px -12px rgba(0,0,0,0.15);
            background: white;
        }
        .card-icon {
            font-size: 2.5rem;
            margin-bottom: 20px;
        }
        .card h3 {
            font-size: 1.5rem;
            margin-bottom: 12px;
        }
        .card p {
            color: #475569;
            margin-bottom: 20px;
        }
        .card-link {
            text-decoration: none;
            font-weight: 600;
            color: #2563eb;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        /* about section */
        .about-wrap {
            display: flex;
            flex-wrap: wrap;
            gap: 40px;
            align-items: center;
            background: #ffffffcc;
            backdrop-filter: blur(4px);
            border-radius: 48px;
            padding: 40px 32px;
            margin: 40px 0;
            box-shadow: 0 8px 24px rgba(0,0,0,0.03);
            border: 1px solid #eef2ff;
        }
        .about-text {
            flex: 2;
        }
        .about-text h2 {
            font-size: 1.9rem;
            margin-bottom: 20px;
        }
        .about-text p {
            margin-bottom: 18px;
            color: #2d3a4b;
        }
        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 20px;
        }
        .skill-tags span {
            background: #e6f0ff;
            padding: 8px 16px;
            border-radius: 40px;
            font-size: 0.85rem;
            font-weight: 500;
            color: #1e40af;
        }
        .about-avatar {
            flex: 1;
            text-align: center;
        }
        .avatar-placeholder {
            background: linear-gradient(145deg, #d9e6ff, #b9d0f0);
            width: 180px;
            height: 180px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            font-size: 4rem;
            box-shadow: 0 20px 30px -10px rgba(0,0,0,0.1);
        }

        /* gh-pages info panel */
        .info-panel {
            background: #0f172a;
            border-radius: 32px;
            padding: 36px 32px;
            margin: 60px 0 40px;
            color: #e2e8f0;
            box-shadow: 0 20px 35px -12px rgba(0,0,0,0.2);
        }
        .info-panel h3 {
            font-size: 1.7rem;
            color: white;
            margin-bottom: 16px;
        }
        .info-panel code {
            background: #1e293b;
            padding: 6px 12px;
            border-radius: 20px;
            font-family: 'SF Mono', 'Fira Code', monospace;
            color: #93c5fd;
        }
        .steps {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
            margin-top: 28px;
        }
        .step {
            background: #1e293b;
            border-radius: 24px;
            padding: 18px 22px;
            flex: 1;
            min-width: 180px;
            transition: all 0.2s;
        }
        .step-number {
            background: #3b82f6;
            width: 32px;
            height: 32px;
            border-radius: 60px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-bottom: 16px;
        }

        /* footer */
        footer {
            text-align: center;
            padding: 48px 0 32px;
            border-top: 1px solid #cbd5e1;
            margin-top: 40px;
            color: #475569;
        }
        footer a {
            color: #2563eb;
            text-decoration: none;
        }

        @media (max-width: 700px) {
            .navbar {
                flex-direction: column;
                gap: 16px;
            }
            .hero h1 {
                font-size: 2.4rem;
            }
            .hero p {
                font-size: 1.1rem;
            }
            .about-wrap {
                flex-direction: column-reverse;
                text-align: center;
            }
            .skill-tags {
                justify-content: center;
            }
        }
        .btn-outline {
            background: transparent;
            border: 1.5px solid #3b82f6;
            color: #3b82f6;
            padding: 8px 20px;
            border-radius: 40px;
            font-weight: 500;
            text-decoration: none;
            transition: 0.2s;
        }
        .btn-outline:hover {
            background: #3b82f6;
            color: white;
        }
    </style>
</head>
<body>

<div class="container">
    <!-- Navigation -->
    <nav class="navbar">
        <div class="logo">✨ quasar.dev</div>
        <ul class="nav-links">
            <li><a href="#">Home</a></li>
            <li><a href="#projects">Projects</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#deploy-guide">GitHub Pages</a></li>
        </ul>
        <a href="https://github.com" target="_blank" class="github-badge">
            <span>🐙</span> GitHub Profile
        </a>
    </nav>

    <!-- Hero section -->
    <section class="hero">
        <h1>Build, Host, Shine<br> on GitHub Pages</h1>
        <p>Your personal corner of the web — free, fast, and powered by Git. This site is fully ready for deployment with GitHub.io.</p>
        <a href="#deploy-guide" class="cta-btn">🚀 Deploy your own →</a>
    </section>

    <!-- Projects section (cards) -->
    <div id="projects">
        <div class="section-title">✨ featured projects</div>
        <div class="grid">
            <div class="card">
                <div class="card-icon">🌐</div>
                <h3>Portfolio 2026</h3>
                <p>Responsive personal website with modern glassmorphism & smooth interactions. Deployed via GitHub Pages.</p>
                <a href="#" class="card-link">Live demo →</a>
            </div>
            <div class="card">
                <div class="card-icon">📊</div>
                <h3>Data Dashboard</h3>
                <p>Interactive dashboard visualizing real-time metrics, built with vanilla JS and Chart.js.</p>
                <a href="#" class="card-link">Repository →</a>
            </div>
            <div class="card">
                <div class="card-icon">🤖</div>
                <h3>AI Playground</h3>
                <p>Experiment with browser-based ML models and creative coding. Open source & community driven.</p>
                <a href="#" class="card-link">Explore →</a>
            </div>
            <div class="card">
                <div class="card-icon">📝</div>
                <h3>Markdown Blog</h3>
                <p>Lightweight blog engine that transforms markdown into static HTML. Perfect for GitHub Pages.</p>
                <a href="#" class="card-link">Read more →</a>
            </div>
        </div>
    </div>

    <!-- About section -->
    <div id="about">
        <div class="about-wrap">
            <div class="about-text">
                <h2>👋 Hey, I'm Alex Rivera</h2>
                <p>Creative front-end architect & open-source enthusiast. I love crafting fast, accessible websites that tell a story. GitHub Pages allows me to ship production-ready projects without worrying about servers or costs.</p>
                <p>My journey started with static HTML/CSS, and now I build modern interfaces using modern tooling — but the magic of simplicity always brings me back to a single `index.html` on a repo.</p>
                <div class="skill-tags">
                    <span>HTML5/CSS3</span>
                    <span>JavaScript (ES2024)</span>
                    <span>React</span>
                    <span>Git & GH Actions</span>
                    <span>Tailwind</span>
                    <span>UX Design</span>
                </div>
                <div style="margin-top: 28px;">
                    <a href="#" class="btn-outline">📄 Resume</a>
                    <a href="#" class="btn-outline" style="margin-left: 12px;">🐙 GitHub @alex-codes</a>
                </div>
            </div>
            <div class="about-avatar">
                <div class="avatar-placeholder">
                    🌟
                </div>
                <p style="margin-top: 15px; font-weight:500;">build with ❤️</p>
            </div>
        </div>
    </div>

    <!-- GitHub Pages deployment guide specific block -->
    <div id="deploy-guide">
        <div class="info-panel">
            <h3>📘 Host this website on GitHub Pages in 5 minutes</h3>
            <p>GitHub Pages turns your repository into a live website — perfect for portfolios, docs, or any static project. Follow the steps below to get <strong>yourusername.github.io</strong> running.</p>
            <div class="steps">
                <div class="step">
                    <div class="step-number">1</div>
                    <strong>Create a repository</strong><br>
                    Name it <code>username.github.io</code> (replace username with your GitHub handle). Public repo.
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <strong>Upload files</strong><br>
                    Add this <code>index.html</code> plus any CSS/JS/assets. Commit to the <code>main</code> branch.
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <strong>Enable Pages</strong><br>
                    Go to Repo → Settings → Pages → Branch: <code>main</code> / <code>/(root)</code> → Save.
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <strong>Visit your site</strong><br>
                    Wait 1–2 min, then open <code>https://username.github.io</code> — magic! ✨
                </div>
            </div>
            <div style="margin-top: 32px; background: #00000030; border-radius: 28px; padding: 18px;">
                💡 <strong>Pro tip:</strong> You can also use a custom domain! Go to Pages settings → Custom domain → add your domain and configure CNAME. Keep everything version-controlled and deploy with every push.
            </div>
        </div>
    </div>

    <!-- additional section: live demo information + custom domain tip -->
    <div style="text-align: center; margin: 20px 0 10px;">
        <div style="display: inline-flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
            <div style="background: white; border-radius: 100px; padding: 10px 28px; box-shadow: 0 5px 12px rgba(0,0,0,0.03);">
                🌍 <strong>Current status:</strong> Ready for <code>github.io</code> deployment
            </div>
            <div style="background: white; border-radius: 100px; padding: 10px 28px;">
                📁 <strong>Repository:</strong> your-account/your-account.github.io
            </div>
        </div>
    </div>

    <!-- extra showcase: quick terminal / git command example -->
    <div style="background: #0b1120; border-radius: 28px; margin: 45px 0 20px; padding: 24px 28px; color: #cbd5e6; font-family: monospace; overflow-x: auto;">
        <p style="color: #94a3b8; margin-bottom: 12px; font-size: 0.85rem;">⚡ Quick deploy via Git CLI (copy-paste ready)</p>
        <code style="display: block; white-space: pre-wrap; word-break: break-word;">
        $ git clone https://github.com/yourusername/yourusername.github.io.git<br>
        $ cd yourusername.github.io<br>
        $ echo "&lt;h1&gt;Hello World&lt;/h1&gt;" > index.html<br>
        $ git add . && git commit -m "Launch my GitHub Pages site"<br>
        $ git push origin main<br>
        ✅ After a few seconds -> https://yourusername.github.io is LIVE!
        </code>
        <p style="margin-top: 18px; font-size: 0.85rem;">💡 Just replace this very file with your own content and push. The future is static & fast.</p>
    </div>

    <!-- footer with credits and additional links -->
    <footer>
        <p>✨ Built with pure HTML/CSS — ready for GitHub Pages deployment • No frameworks, no bloat ✨</p>
        <p style="margin-top: 16px;">
            <a href="#">Docs</a> &nbsp;|&nbsp;
            <a href="#">GitHub Template</a> &nbsp;|&nbsp;
            <a href="#">MIT License</a> &nbsp;|&nbsp;
            <a href="https://pages.github.com" target="_blank">Official GitHub Pages Guide</a>
        </p>
        <p style="margin-top: 24px; font-size: 0.8rem;">© 2026 — Hosted on GitHub, designed to inspire. Your next idea starts here.</p>
    </footer>
</div>

<!-- optional smooth scroll behaviour for internal links -->
<script>
    (function() {
        // Enable smooth scroll for anchor links
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === "#" || targetId === "") return;
                const targetElem = document.querySelector(targetId);
                if (targetElem) {
                    e.preventDefault();
                    targetElem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // small dynamic year update in footer if needed (optional)
        const yearSpan = document.querySelector('.footer-year');
        if (yearSpan) yearSpan.innerText = new Date().getFullYear();

        // interactive badge: console greet for devs
        console.log("%c✨ GitHub Pages website loaded — ready to deploy! ✨", "color: #3b82f6; font-size: 14px; font-weight: bold;");
        console.log("Go to repo Settings -> Pages to activate your live site.");
    })();
</script>
</body>
</html>
