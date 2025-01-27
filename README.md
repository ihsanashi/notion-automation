# Introduction

This project was inspired out of my need to avoid paying for an expensive automation tool (Zapier, for instance), and also provided an opportunity for me to learn and work on a backend-only project. The background of this project came about because I'm looking to move out of my apartment in the next few months, and I wanted to list the items available for sale in a Notion database. Once an item has been added, I wanted there to be a [WhatsApp link](https://faq.whatsapp.com/5913398998672934/?helpref=hc_fnav) that interested parties can click on, to start a conversation easily with me on the item that they are interested in.

This was easily done with Zapier, and I had in fact created a working Zap on their platform. But there were a few drawbacks if I were to rely on them. The main one being the limited [Tasks](https://help.zapier.com/hc/en-us/articles/8496196837261-How-is-task-usage-measured-in-Zapier) available. This project isn't going to last long, so I don't want to commit into subscribing to one of their plans. The Free tier is only limited to 100 tasks per month too, so I doubt I can keep to within those bounds.

Alas, I decided to build my own solution which should theoretically work. I've never worked on a backend only project, so this would be a first. The idea is simple.

1. I would create a new item listing in my Notion Database
2. For that Database, I would add a Webhook, that when triggered by the creation of a new item, will send an HTTP POST request to my backend (this project). The request would also include the content related to that item (for now, I think I'd only need the page's URL and item title)
3. My backend will format the text according to what's specified by WhatsApp
4. My backend will update the Notion Database item to include the WhatsApp link

The last 2 will involve integrating with Notion's REST API.

I'll update this README later with proper documentation once I've got a working solution.
