export const DENTAL_FACTS = [
  'Enamel is the hardest substance in the human body — even stronger than bone.',
  'Humans normally grow 32 permanent teeth, including 4 wisdom teeth.',
  'Your teeth begin developing before you are even born.',
  'Saliva helps protect your teeth by neutralizing acids and washing away food.',
  'Brushing for two minutes twice a day prevents most plaque buildup.',
  'No two people have the same teeth — your dental imprint is unique.',
  'Tooth decay is one of the most common chronic conditions worldwide — and largely preventable.',
  'Flossing cleans up to 40% of tooth surfaces your brush cannot reach.',
  'Your bite can exert up to 70 kg of force on your molars.',
  'Replacing a missing tooth early prevents neighboring teeth from shifting.',
]

export function dailyFact() {
  const day = Math.floor(Date.now() / 864e5)
  return DENTAL_FACTS[day % DENTAL_FACTS.length]
}
