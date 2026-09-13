


export default function Home() {
  return (
    <div style={{ margin: '30% auto 0px' , textAlign: 'center', padding: 'var(--spacing-xl)', fontSize: '1.25rem', fontWeight: '500'}}>
      Want to start the journey? Click the button below to connect your wallet and begin your adventure!
      <br/>
      <a href = '/home'><button style={{ marginTop: 'var(--spacing-lg)', height: '40px', width: '120px', fontWeight: '700' }}>Let&apos;s Go!</button></a>
    </div>
  );
}