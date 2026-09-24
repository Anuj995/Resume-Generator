import { NextRequest, NextResponse } from "next/server";

interface GitHubRepoItem {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  fork: boolean;
  updated_at: string;
}

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    const cleanUsername = (username || "").trim().replace(/^@/, "").replace(/\/$/, "");

    if (!cleanUsername) {
      return NextResponse.json(
        { error: "Please enter a GitHub username." },
        { status: 400 }
      );
    }

    // Basic format check for GitHub usernames (1-39 alphanumeric characters or hyphens)
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Invalid GitHub username format. Please check the username." },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ResumeGen-App",
    };

    // Optional: Use GITHUB_TOKEN from env if available to increase rate limits
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // 1. Fetch user public profile
    const userRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(cleanUsername)}`,
      { headers }
    );

    if (userRes.status === 404) {
      return NextResponse.json(
        { error: "GitHub profile not found. Please check the username." },
        { status: 404 }
      );
    }

    if (!userRes.ok) {
      if (userRes.status === 403) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again in a few minutes." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Unable to fetch GitHub information. Please try again." },
        { status: userRes.status }
      );
    }

    const userData = await userRes.json();

    // 2. Fetch public repositories (latest 30, sorted by updated date)
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=updated&per_page=30`,
      { headers }
    );

    let reposData: GitHubRepoItem[] = [];
    if (reposRes.ok) {
      reposData = await reposRes.json();
    }

    return NextResponse.json({
      user: {
        login: userData.login,
        name: userData.name || userData.login,
        bio: userData.bio || "",
        location: userData.location || "",
        blog: userData.blog || "",
        avatar_url: userData.avatar_url || "",
        html_url: userData.html_url || `https://github.com/${userData.login}`,
        public_repos: userData.public_repos || 0,
      },
      repos: (reposData || []).map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description || "",
        html_url: r.html_url,
        language: r.language || "",
        topics: Array.isArray(r.topics) ? r.topics : [],
        stargazers_count: r.stargazers_count || 0,
        fork: Boolean(r.fork),
        updated_at: r.updated_at,
      })),
    });
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      { error: "Unable to fetch GitHub information. Please try again." },
      { status: 500 }
    );
  }
}
