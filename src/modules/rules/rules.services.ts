import { Injectable } from '@nestjs/common';
import { Engine, Rule } from 'json-rules-engine';

@Injectable()
export class RulesEngineService {
  private engine: Engine;

  constructor() {
    this.engine = new Engine();
    // this.initializeRules();
    // this.initializeBookingRules();
    // this.initializeBusinessRules();
  }

  addRule(rule: Rule) {
    this.engine.addRule(rule);
  }

  async run2(facts: any) {
    const unsatisfied = [];
    const conditionResults: any[] = [];
    this.engine.on('failure', (event: Event, almanac, ruleResult) => {
      conditionResults.push({
        event: event.type,
        conditions: ruleResult.conditions,
      });
    });
    const { events } = await this.engine.run(facts);

    return { events, notSatisfiedConditions: conditionResults };
  }
  async run1(facts: any) {
    const { events } = await this.engine.run(facts);
    return events;
  }
  async run(facts: any) {
    const notSatisfiedConditions: any[] = [];

    const collectUnsatisfiedConditions = (conditions, results) => {
      if (Array.isArray(conditions.all)) {
        for (const condition of conditions.all) {
          if (condition.fact) {
            if (!condition.result) {
              results.push({
                fact: condition.fact,
                operator: condition.operator,
                value: condition.value,
                result: condition.result,
              });
            }
          } else {
            if (condition.all) {
              collectUnsatisfiedConditions(condition.all, results);
            }
            if (condition.any) {
              collectUnsatisfiedConditions(condition.any, results);
            }
          }
        }
      }
    };

    this.engine.on('failure', (event: Event, almanac, ruleResult) => {
      const unsatisfied = [];
      collectUnsatisfiedConditions(ruleResult.conditions, unsatisfied);
      notSatisfiedConditions.push({
        event: event.type,
        conditions: unsatisfied,
      });
    });

    const { events } = await this.engine.run(facts);

    return { events, notSatisfiedConditions };
  }

  public initializeBookingRules(propertyName) {
    this.engine = new Engine();
    const rules: Rule[] = [
      new Rule({
        name: 'The Crown Jewel',
        conditions: {
          all: [
            {
              fact: 'NoOfPets',
              operator: 'lessThanInclusive',
              value: 2,
            },
            {
              fact: 'NoOfGuests',
              operator: 'lessThanInclusive',
              value: 10,
            },
          ],
        },
        event: {
          type: 'property-validation',

          params: {
            message: 'Property details are valid',
            property: 'The Crown Jewel',
          },
        },
      }),
      new Rule({
        name: 'The Oasis',
        conditions: {
          all: [
            {
              fact: 'NoOfPets',
              operator: 'lessThanInclusive',
              value: 2,
            },
            {
              fact: 'NoOfGuests',
              operator: 'lessThanInclusive',
              value: 40,
            },
          ],
        },
        event: {
          type: 'property-validation',
          params: {
            message: 'Property details are valid',
            property: 'The Oasis',
          },
        },
      }),
    ];
 
    
    const filteredRules = rules.filter((x) => x.name == propertyName);
    filteredRules.forEach((rule) => this.engine.addRule(rule));
  }

  private initializeRules() {
    const rules: Rule[] = [
      new Rule({
        conditions: {
          all: [
            {
              fact: 'age',
              operator: 'greaterThanInclusive',
              value: 18,
            },
            {
              fact: 'country',
              operator: 'equal',
              value: 'USA',
            },
          ],
        },
        event: {
          type: 'content-access',
          params: {
            message: 'User is allowed to access content',
          },
        },
      }),
    ];

    rules.forEach((rule) => this.addRule(rule));
  }
  private initializeBusinessRules() {
    const rules: Rule[] = [
      new Rule({
        conditions: {
          any: [
            {
              all: [
                {
                  fact: 'PropertyName',
                  operator: 'equal',
                  value: 'The Crown Jewel',
                },
                {
                  fact: 'NoOfPets',
                  operator: 'lessThanInclusive',
                  value: 2,
                },
                {
                  fact: 'NoOfGuests',
                  operator: 'lessThanInclusive',
                  value: 10,
                },
              ],
            },
            {
              all: [
                {
                  fact: 'PropertyName',
                  operator: 'equal',
                  value: 'The Oasis',
                },
                {
                  fact: 'NoOfPets',
                  operator: 'lessThanInclusive',
                  value: 2,
                },
                {
                  fact: 'NoOfGuests',
                  operator: 'lessThanInclusive',
                  value: 40,
                },
              ],
            },
          ],
        },
        event: {
          // define the event to fire when the conditions evaluate truthy
          type: 'property-validation',
          params: {
            message: 'Property details are Valid!',
          },
        },
      }),
    ];

    rules.forEach((rule) => this.addRule(rule));
  }
}
