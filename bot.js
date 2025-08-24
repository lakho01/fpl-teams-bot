const { ActivityHandler, MessageFactory } = require('botbuilder');
const axios = require('axios');

class FPLBot extends ActivityHandler {
    constructor() {
        super();
        
        this.leagueId = process.env.FPL_LEAGUE_ID;
        
        this.onMessage(async (context, next) => {
            const userMessage = context.activity.text.toLowerCase().trim();
            
            if (userMessage.includes('show-league') || userMessage.includes('standings')) {
                await this.sendLeagueStandings(context);
            } else {
                await context.sendActivity(MessageFactory.text('Hi! Send me "show-league" to see FPL standings! 🏆'));
            }
            
            await next();
        });

    }

    async sendLeagueStandings(context) {
        try {
            const standings = await this.getFPLStandings();
            await context.sendActivity(MessageFactory.text(standings));
        } catch (error) {
            await context.sendActivity(MessageFactory.text('Sorry, couldn\'t fetch league data right now! 😕'));
            console.error('FPL API Error:', error);
        }
    }

    async getFPLStandings() {
        const url = `https://fantasy.premierleague.com/api/leagues-classic/${this.leagueId}/standings/`;
        const response = await axios.get(url);
        
        const standings = response.data.standings.results;
        let message = '🏆 **Current League Standings** 🏆\n\n';
        
        standings.forEach((entry, index) => {
            message += `${index + 1}) ${entry.player_name} - ${entry.entry_name} - ${entry.total} pts\n`;
        });
        
        return message;
    }
}

module.exports.FPLBot = FPLBot;
