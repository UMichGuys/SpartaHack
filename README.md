******************************************************
V1.0 3:01
V1.1 6:34
******************************************************


------UI------

Create "Utterances"

- Goals
  - Start function call
    - What function or commands?
    - how deep should function go?
    -

- Potential Problems
  - Cant go too deep
    - not UI issue
  - Can we handle two slots?
  - Most 3 options?
  - EX: How do I delete?
    - Alexa responds with 2 most common options and prompts user if they want more info
  - EX: How do I delete _____?
    - can alexa handle two slots
      - YES, very well
      - We now have queries
  - EX: How do I delete 3/4/10/n _____? 
    - Will alexa recognize an integer and respond with n?
      -YES use AMAZON.NUMBER
- Nomenclature
  - RequestCmdGenIntent
    * 
    *
    *
  - RequestCmdSpeIntent
    *
    *
    *
    *


-V1.1 Sample Utterances-

GiveToolIntent tell me about {Tool}
GiveToolIntent tell me more about {Tool}
GiveToolIntent give me information about {Tool}
GiveToolIntent give me more information about {Tool}
GiveToolIntent give me info about {Tool}
GiveToolIntent give me more info about {Tool}
GiveToolIntent how do I use {Tool}
WhatsMyToolIntent what's my tool
WhatsMyToolIntent what is my tool
WhatsMyToolIntent what's my selected tool
WhatsMyToolIntent what is my selected tool
RequestCmdGenIntent {Query} {CmdGen}
RequestCmdSpeIntent {Query} AMAZON.NUMBER {CmdSpe}
RequestCmdSpeIntent {Query} {CmdSpe}

-------_Ut-------------


-Tree struct
  - see slack


-----N_UI-----


----Backend----

Respond to "Utterances"

-Goals
  - respond effectively to utterances and find json
  - potentially provide a card to the user on their computer

-Problems
  - We currently dont have access to a JSON Data function
  - Need to interface with duchan and maroukis
  - 

-Nomenclature
 - GiveCmdGenIntent
   *
   *
   *
   *
 - GiveCmdSpeIntent
   *
   *
   *
   *


---N_Backend----

