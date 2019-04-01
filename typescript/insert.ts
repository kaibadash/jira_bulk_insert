import * as dotenv from "dotenv";
import * as fs from "fs";
import * as JiraApi from "jira-connector"; // d.ts is not provided...
import * as _ from "underscore";
dotenv.config();

const jira = new JiraApi({
  protocol: "https",
  host: process.env.JIRA_HOST,
  basic_auth: {
    username: process.env.JIRA_USER,
    password: process.env.JIRA_PASSWORD
  }
});

export async function insert(title: string, description: string) {
  if (!title || !description) {
    console.log("Skip empty title or description");
    return;
  }

  console.log(`Start import: ${title} ${description}`);
  const issue = {
    fields: {
      summary: title,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              {
                text: description,
                type: "text"
              }
            ]
          }
        ]
      }
    }
  };

  const res = await jira.issue.createIssue({
    fields: {
      project: { id: process.env.JIRA_PROJECT_ID },
      issuetype: { id: process.env.JIRA_ISSUE_TYPE },
      summary: title,
      description
    }
  });
  console.log(res);
  return;
}

async function main() {
  const input = fs.readFileSync("/dev/stdin", "utf8");
  for (const row of input.split("\n")) {
    console.log(row);
    const columns = row.split("\t");
    await insert(columns[0], columns[1]);
  }
}

main();
