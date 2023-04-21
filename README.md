# Bridge GPT Installation Instructions

Note: You will need your Bridge GPT username and password to complete the installation.

## 1: Set up the Git Submodule

#### Steps
1. Navigate to your storefront's root directory in a command line terminal, and then enter these commands:
2. git submodule add https://github.com/Discount-Obvious/bridge-sfcc ./cartridges/int_bridge_gpt
2. git add .gitmodules ./cartridges/int_bridge_gpt
3. git commit -m "[Your JIRA ticket]: Bridge GPT init"

#### Notes
Bridge GPT distributes its cartridge through a git submodule. A git submodule is like a repository within a repository. With a git submodule you can use standard git methods to keep the Bridge cartridge up to date.

This is an extremely important feature. Because the AI LLM space is changing so rapidly, you will want to stay current with the latest advances, and we will make that easy for you to do.

## 2: Install NPM dependencies

#### Steps:
1. Navigate to int_bridge_gpt in a command line terminal.
2. Using node version 12.22.22 or newer, enter the command: ```npm install```

#### Notes
By default the cartridge is set up to track dependencies separately from the main repository. This allows us to update our cartridge dependencies easily without worrying about interfering with the main repository.

If it's necessary for your build process, you can move the contents of our package.json into your main repository and the cartridge will still work. However, we do not recommend this.

## 3: Import Metadata

#### Steps:
1. Upload sys-object-types: Administration > Site Development > Import & Export - click the Upload link on the page.
2. Import bridge-object-types and DO NOT check the box that says to “Delete existing attribute definitions and attribute groups not contained in the import file”
3. Upload both services and jobs to Administration > Operations > Import & Export - click the upload link on the page.
4. Import both the services and jobs.

#### Notes:
Job must be at the site level. 

## 4: Input Credentials

#### Steps
1. Update Bridge’s services credentials with the same username and password combination.

#### Notes
When you signed up you should have received a username, development password, and production password by email.

## 5: Update Preferences & Cartridge Path

#### Steps
1. Update preferences: at minimum, you should enable Bridge GPT where you want to test it, eg, PDP, PLP etc.
2. You may also want to update the Bridge GPT preferences so the chat model behaves how you want, although you can come back and do this later. 
3. Add int_bridge_gpt to your cartridge path. It is not especially important where you put it in the cartridge path. 

#### Notes
Please remember: when you update your settings preferences, you have to run the ‘Export-Settings’ job for it to take effect. For example, if you update the relevance keywords or change the default prompt, you have to synchronize with the Bridge GPT API by running the job. 

## 6: Run the Export-Settings Job

#### Steps
1. Go to Administration > Operations > Jobs. Run the ‘BGPT_Export_Settings’ job. 

#### Notes
To save your settings you should run the export settings job. This will save the configuration for your environment on your server, so it will be available to the AI model. 

Your settings are specific to your instance. Updating them in one does not update them in another. 

## 7: Install Front-end Assets

#### Steps

1. Because the front-end design of B2C Commerce storefronts can vary so much we ask that you find the correct plan to install each front-end asset in your implementation. Include Bridge’s front-end assets into your setup. 
2. The list of all front-end assets: 
- questions.js
- bridgeQuestionsModal
- helpQuestionLink
- productTileQuestionLink
- productDetailQuestionLink
- _bridge-gpt.scss
3. Example links for all front-end assets: 
- Client side javascript: processInclude(require('../../../../../int_bridge_gpt/cartridge/client/default/js/components/questions'));
- Modal: <isinclude template="components/bridgeQuestionsModal" />
- Tile Link: <isinclude template="product/components/productTileQuestionLink" />
- Help Link: <isinclude template="product/components/helpQuestionLink" />
- Detail Link: <isinclude template="product/components/productDetailQuestionLink" />
- Sass Import: @import "../../../../../int_bridge_gpt/cartridge/client/default/scss/components/bridge-gpt";

#### Notes
You need to include the questions.js script and the bridgeQuestionsModal.isml on any page where you want Bridge to work. Without these two, Bridge will not initialize. 

Feel free to customize the look and feel of the Bridge widget to match the design of your brand. We intentionally leave the design open to you and do not present any Bridge GPT branding to your customers. 

However, we strongly recommend against adding any customizations to the questions.js client-side script. This script is key to successfully calling the bridge service, and modifications to it could prevent Bridge from working.

If you feel like you have to customize the client-side questions.js script or Bridge’s back-end functionality to meet your requirements, consider reaching out to us first. We may be able to suggest a way to customize your instance without interfering with your ability to pull down upgrades and updates. 

## 8: Installation Complete - Plan Next Steps

Your installation is complete. You should now be able to talk to the AI model on your Storefront. However, it would not have enough information yet to answer questions about your company’s policies or products. 

Start planning what data the AI model will need to answer questions intelligently. We recommend imagining you were training a human and asking, ‘what information would a new sales or support agent need to do their job successfully?’

After an initial internal planning session, reach out to us at: info@bridgegpt.ai. Together, we will plan next steps. 