/**
 * Diagram template interface defining the structure for all diagram templates
 */
export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
  type: string;
}

/**
 * Pre-defined diagram templates organized by type for easy access
 * These templates provide users with common starting points for different diagram types
 */
export const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  // Flow Charts - most common and easiest to understand
  {
    id: 'simple-flow',
    name: 'Simple Process',
    description: 'Basic process with start and end',
    type: 'flowchart',
    code: `flowchart LR
  Start([Start]) --> Process[Do Something] --> End([End])`
  },
  {
    id: 'decision-flow',
    name: 'Yes/No Decision',
    description: 'Process with a decision point',
    type: 'flowchart',
    code: `flowchart TD
  Start([Start]) --> Question{Yes or No?}
  Question -->|Yes| YesPath[Do This]
  Question -->|No| NoPath[Do That]
  YesPath --> End([End])
  NoPath --> End`
  },
  {
    id: 'multi-step',
    name: 'Multi-Step Process',
    description: 'Three step process with branches',
    type: 'flowchart',
    code: `flowchart TD
  Start([Start]) --> Step1[Step 1]
  Step1 --> Step2[Step 2]
  Step2 --> Step3[Step 3]
  Step3 --> End([End])
  Step1 -.-> Option[Optional Step]
  Option -.-> End`
  },
  {
    id: 'subgraph-flow',
    name: 'Process with Subgraphs',
    description: 'Groups related steps',
    type: 'flowchart',
    code: `flowchart TB
  Start([Start]) --> Process
  
  subgraph Process
    Step1[Step 1] --> Step2[Step 2]
    Step2 --> Step3[Step 3]
  end
  
  Process --> End([End])`
  },
  
  // Sequence Diagrams - for showing interactions between components
  {
    id: 'simple-sequence',
    name: 'Simple Conversation',
    description: 'Basic exchange between two actors',
    type: 'sequence',
    code: `sequenceDiagram
  Person A->>Person B: Hello!
  Person B-->>Person A: Hi there!`
  },
  {
    id: 'system-sequence',
    name: 'System Interaction',
    description: 'User interacting with system',
    type: 'sequence',
    code: `sequenceDiagram
  User->>System: Request data
  System->>Database: Query information
  Database-->>System: Return results
  System-->>User: Show information`
  },
  {
    id: 'async-sequence',
    name: 'Asynchronous Calls',
    description: 'Shows async interactions',
    type: 'sequence',
    code: `sequenceDiagram
  Client->>+Server: Request Data
  Server-->>-Client: Acknowledge
  
  Note right of Server: Processing request
  Server->>+Database: Query
  Database-->>-Server: Results
  
  Server-->>Client: Response with data`
  },
  
  // Pie Charts - simple distributions
  {
    id: 'simple-pie',
    name: 'Simple Distribution',
    description: 'Basic 3-section pie chart',
    type: 'pie',
    code: `pie title Distribution
  "Section A" : 40
  "Section B" : 30
  "Section C" : 30`
  },
  {
    id: 'project-breakdown',
    name: 'Project Breakdown',
    description: 'Project phases breakdown',
    type: 'pie',
    code: `pie title Project Phases
  "Planning" : 20
  "Development" : 50
  "Testing" : 20
  "Deployment" : 10`
  },
  
  // Class Diagrams - for object oriented design
  {
    id: 'simple-class',
    name: 'Simple Class',
    description: 'Basic class with methods',
    type: 'class',
    code: `classDiagram
  class Animal {
    +String name
    +int age
    +makeSound() void
    +move() void
  }`
  },
  {
    id: 'inheritance',
    name: 'Class Inheritance',
    description: 'Shows inheritance relationship',
    type: 'class',
    code: `classDiagram
  class Animal {
    +String name
    +makeSound() void
  }
  class Dog {
    +String breed
    +bark() void
  }
  class Cat {
    +String color
    +meow() void
  }
  Animal <|-- Dog
  Animal <|-- Cat`
  },
  
  // ER Diagrams - for database schema
  {
    id: 'simple-er',
    name: 'Simple ER Diagram',
    description: 'Basic entity relationships',
    type: 'er',
    code: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE-ITEM : contains
  CUSTOMER {
    string name
    string email
  }
  ORDER {
    int id
    date created
  }`
  },
  {
    id: 'blog-er',
    name: 'Blog Database',
    description: 'Blog database schema',
    type: 'er',
    code: `erDiagram
  USER ||--o{ POST : writes
  USER ||--o{ COMMENT : makes
  POST ||--o{ COMMENT : has
  POST {
    int id
    string title
    string content
    date published
  }
  USER {
    int id
    string name
    string email
  }
  COMMENT {
    int id
    string content
    date created
  }`
  },
  
  // Gantt Charts - for project planning
  {
    id: 'simple-gantt',
    name: 'Simple Project Plan',
    description: 'Basic project timeline',
    type: 'gantt',
    code: `gantt
  title Project Schedule
  dateFormat  YYYY-MM-DD
  
  section Planning
  Project Kickoff    :a1, 2023-01-01, 7d
  Requirements       :a2, after a1, 14d
  
  section Development
  Design             :a3, after a2, 10d
  Implementation     :a4, after a3, 21d
  
  section Testing
  QA Testing         :a5, after a4, 14d
  Bug Fixes          :a6, after a5, 7d
  
  section Deployment
  Deployment         :a7, after a6, 3d
  Documentation      :a8, after a7, 7d`
  },
];

/**
 * Get templates filtered by diagram type
 */
export const getTemplatesByType = (type: string): DiagramTemplate[] => {
  return DIAGRAM_TEMPLATES.filter(template => template.type === type);
}; 